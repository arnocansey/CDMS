package com.cdms.service;

import com.cdms.entity.DonorRetention;
import com.cdms.entity.Member;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.DonorRetentionRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.OfferingRepository;
import com.cdms.repository.TitheRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DonorRetentionService {

    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final OfferingRepository offeringRepository;
    private final MemberRepository memberRepository;
    private final DonorRetentionRepository donorRetentionRepository;

    public DonorRetentionService(DonationRepository donationRepository,
                                 TitheRepository titheRepository,
                                 OfferingRepository offeringRepository,
                                 MemberRepository memberRepository,
                                 DonorRetentionRepository donorRetentionRepository) {
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.offeringRepository = offeringRepository;
        this.memberRepository = memberRepository;
        this.donorRetentionRepository = donorRetentionRepository;
    }

    public List<DonorRetention> calculateRetention(Long churchId, String period) {
        LocalDate[] currentRange = getQuarterDateRange(period);
        LocalDate[] previousRange = getPreviousQuarterDateRange(period);

        Set<Long> currentPeriodDonors = getDonorIdsForChurchAndDateRange(churchId, currentRange[0], currentRange[1]);
        Set<Long> previousPeriodDonors = getDonorIdsForChurchAndDateRange(churchId, previousRange[0], previousRange[1]);

        Set<Long> allDonorIds = new HashSet<>();
        allDonorIds.addAll(currentPeriodDonors);
        allDonorIds.addAll(previousPeriodDonors);

        List<DonorRetention> results = new ArrayList<>();

        for (Long memberId : allDonorIds) {
            Optional<Member> memberOpt = memberRepository.findById(memberId);
            if (memberOpt.isEmpty()) continue;
            Member member = memberOpt.get();
            if (member.getChurchId() != null && !member.getChurchId().equals(churchId)) continue;

            boolean gaveCurrent = currentPeriodDonors.contains(memberId);
            boolean gavePrevious = previousPeriodDonors.contains(memberId);

            String status;
            if (gaveCurrent && gavePrevious) {
                status = "ACTIVE";
            } else if (gaveCurrent && !gavePrevious) {
                status = "NEW";
            } else if (!gaveCurrent && gavePrevious) {
                status = "LAPSED";
            } else {
                status = "RETURNED";
            }

            BigDecimal totalGiven = getTotalForMemberAndRange(churchId, memberId, currentRange[0], currentRange[1]);
            int donationCount = getDonationCountForMemberAndRange(churchId, memberId, currentRange[0], currentRange[1]);
            BigDecimal avgGift = donationCount > 0
                    ? totalGiven.divide(BigDecimal.valueOf(donationCount), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            DonorRetention retention = new DonorRetention(member, period, totalGiven, donationCount, status);
            retention.setChurchId(churchId);
            retention.setAverageGift(avgGift);
            retention.setLastDonationDate(getLastDonationDateForMemberAndRange(churchId, memberId, currentRange[0], currentRange[1]));
            results.add(retention);
        }

        donorRetentionRepository.saveAll(results);
        return results;
    }

    public Map<String, Object> getRetentionReport(Long churchId, String period) {
        List<DonorRetention> records = donorRetentionRepository.findByChurchIdAndPeriod(churchId, period);

        long activeCount = records.stream().filter(r -> "ACTIVE".equals(r.getRetentionStatus())).count();
        long newCount = records.stream().filter(r -> "NEW".equals(r.getRetentionStatus())).count();
        long returnedCount = records.stream().filter(r -> "RETURNED".equals(r.getRetentionStatus())).count();
        long lapsedCount = records.stream().filter(r -> "LAPSED".equals(r.getRetentionStatus())).count();
        long totalDonors = records.size();

        BigDecimal retentionRate = totalDonors > 0
                ? BigDecimal.valueOf(activeCount)
                    .add(BigDecimal.valueOf(returnedCount))
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalDonors), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("period", period);
        report.put("totalDonors", totalDonors);
        report.put("activeCount", activeCount);
        report.put("newCount", newCount);
        report.put("returnedCount", returnedCount);
        report.put("lapsedCount", lapsedCount);
        report.put("retentionRate", retentionRate);
        return report;
    }

    public List<Map<String, Object>> getRetentionTrend(Long churchId, int quarters) {
        List<Map<String, Object>> trend = new ArrayList<>();
        String currentPeriod = getCurrentQuarterPeriod();

        for (int i = 0; i < quarters; i++) {
            String period = getQuarterPeriodOffset(currentPeriod, -i);
            Map<String, Object> report = getRetentionReport(churchId, period);
            trend.add(report);
        }

        Collections.reverse(trend);
        return trend;
    }

    private Set<Long> getDonorIdsForChurchAndDateRange(Long churchId, LocalDate from, LocalDate to) {
        Set<Long> donorIds = new HashSet<>();

        donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to)
                .forEach(d -> { if (d.getMember() != null) donorIds.add(d.getMember().getId()); });

        titheRepository.findByChurchIdAndTitheDateBetween(churchId, from, to)
                .forEach(t -> { if (t.getMember() != null) donorIds.add(t.getMember().getId()); });

        return donorIds;
    }

    private BigDecimal getTotalForMemberAndRange(Long churchId, Long memberId, LocalDate from, LocalDate to) {
        BigDecimal donations = donationRepository.sumByChurchIdAndMemberId(churchId, memberId);

        List<com.cdms.entity.Tithe> tithes = titheRepository.findByMemberId(memberId);
        BigDecimal titheTotal = tithes.stream()
                .filter(t -> t.getChurchId().equals(churchId) && !t.getTitheDate().isBefore(from) && !t.getTitheDate().isAfter(to))
                .map(com.cdms.entity.Tithe::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return donations.add(titheTotal);
    }

    private int getDonationCountForMemberAndRange(Long churchId, Long memberId, LocalDate from, LocalDate to) {
        int donationCount = (int) donationRepository.findByMemberId(memberId).stream()
                .filter(d -> d.getDonationDate() != null && !d.getDonationDate().isBefore(from) && !d.getDonationDate().isAfter(to))
                .count();

        int titheCount = (int) titheRepository.findByMemberId(memberId).stream()
                .filter(t -> t.getChurchId().equals(churchId) && !t.getTitheDate().isBefore(from) && !t.getTitheDate().isAfter(to))
                .count();

        return donationCount + titheCount;
    }

    private LocalDate getLastDonationDateForMemberAndRange(Long churchId, Long memberId, LocalDate from, LocalDate to) {
        LocalDate lastDate = null;

        List<com.cdms.entity.Donation> donations = donationRepository.findByMemberId(memberId);
        for (com.cdms.entity.Donation d : donations) {
            if (d.getDonationDate() != null && !d.getDonationDate().isBefore(from) && !d.getDonationDate().isAfter(to)) {
                if (lastDate == null || d.getDonationDate().isAfter(lastDate)) {
                    lastDate = d.getDonationDate();
                }
            }
        }

        List<com.cdms.entity.Tithe> tithes = titheRepository.findByMemberId(memberId);
        for (com.cdms.entity.Tithe t : tithes) {
            if (t.getChurchId().equals(churchId) && !t.getTitheDate().isBefore(from) && !t.getTitheDate().isAfter(to)) {
                if (lastDate == null || t.getTitheDate().isAfter(lastDate)) {
                    lastDate = t.getTitheDate();
                }
            }
        }

        return lastDate;
    }

    private LocalDate[] getQuarterDateRange(String period) {
        String[] parts = period.split("-Q");
        int year = Integer.parseInt(parts[0]);
        int quarter = Integer.parseInt(parts[1]);

        int startMonth = (quarter - 1) * 3 + 1;
        LocalDate start = LocalDate.of(year, startMonth, 1);
        LocalDate end = start.plusMonths(3).minusDays(1);
        return new LocalDate[]{start, end};
    }

    private LocalDate[] getPreviousQuarterDateRange(String period) {
        String[] parts = period.split("-Q");
        int year = Integer.parseInt(parts[0]);
        int quarter = Integer.parseInt(parts[1]);

        if (quarter == 1) {
            return getQuarterDateRange((year - 1) + "-Q4");
        }
        return getQuarterDateRange(year + "-Q" + (quarter - 1));
    }

    private String getCurrentQuarterPeriod() {
        LocalDate now = LocalDate.now();
        int quarter = (now.getMonthValue() - 1) / 3 + 1;
        return now.getYear() + "-Q" + quarter;
    }

    private String getQuarterPeriodOffset(String period, int offset) {
        String[] parts = period.split("-Q");
        int year = Integer.parseInt(parts[0]);
        int quarter = Integer.parseInt(parts[1]);

        int totalQuarters = year * 4 + (quarter - 1) + offset;
        int newYear = totalQuarters / 4;
        int newQuarter = (totalQuarters % 4) + 1;
        return newYear + "-Q" + newQuarter;
    }
}
