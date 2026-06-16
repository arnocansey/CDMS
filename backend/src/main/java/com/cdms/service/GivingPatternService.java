package com.cdms.service;

import com.cdms.entity.Donation;
import com.cdms.entity.Tithe;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.OfferingRepository;
import com.cdms.repository.TitheRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GivingPatternService {

    private final DonationRepository donationRepository;
    private final TitheRepository titheRepository;
    private final OfferingRepository offeringRepository;

    public GivingPatternService(DonationRepository donationRepository,
                                TitheRepository titheRepository,
                                OfferingRepository offeringRepository) {
        this.donationRepository = donationRepository;
        this.titheRepository = titheRepository;
        this.offeringRepository = offeringRepository;
    }

    public Map<String, BigDecimal> getGivingHeatmap(Long churchId, LocalDate from, LocalDate to) {
        Map<String, BigDecimal> heatmap = new LinkedHashMap<>();

        for (DayOfWeek day : DayOfWeek.values()) {
            for (int hour = 0; hour < 24; hour++) {
                heatmap.put(day.getDisplayName(TextStyle.SHORT, Locale.ENGLISH) + " " + String.format("%02d:00", hour), BigDecimal.ZERO);
            }
        }

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to);
        for (Donation d : donations) {
            if (d.getCreatedAt() != null) {
                String key = d.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                        + " " + String.format("%02d:00", d.getCreatedAt().getHour());
                heatmap.merge(key, d.getAmount(), BigDecimal::add);
            }
        }

        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, from, to);
        for (Tithe t : tithes) {
            if (t.getCreatedAt() != null) {
                String key = t.getCreatedAt().getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
                        + " " + String.format("%02d:00", t.getCreatedAt().getHour());
                heatmap.merge(key, t.getAmount(), BigDecimal::add);
            }
        }

        return heatmap;
    }

    public Map<String, BigDecimal> getGivingByDayOfWeek(Long churchId, LocalDate from, LocalDate to) {
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        for (DayOfWeek day : DayOfWeek.values()) {
            result.put(day.getDisplayName(TextStyle.FULL, Locale.ENGLISH), BigDecimal.ZERO);
        }

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to);
        for (Donation d : donations) {
            if (d.getDonationDate() != null) {
                String dayName = d.getDonationDate().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                result.merge(dayName, d.getAmount(), BigDecimal::add);
            }
        }

        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, from, to);
        for (Tithe t : tithes) {
            if (t.getTitheDate() != null) {
                String dayName = t.getTitheDate().getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                result.merge(dayName, t.getAmount(), BigDecimal::add);
            }
        }

        return result;
    }

    public Map<String, BigDecimal> getGivingByMonth(Long churchId, int year) {
        Map<String, BigDecimal> result = new LinkedHashMap<>();
        for (int month = 1; month <= 12; month++) {
            result.put(java.time.Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH), BigDecimal.ZERO);
        }

        LocalDate yearStart = LocalDate.of(year, 1, 1);
        LocalDate yearEnd = LocalDate.of(year, 12, 31);

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, yearStart, yearEnd);
        for (Donation d : donations) {
            if (d.getDonationDate() != null) {
                String monthName = d.getDonationDate().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                result.merge(monthName, d.getAmount(), BigDecimal::add);
            }
        }

        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, yearStart, yearEnd);
        for (Tithe t : tithes) {
            if (t.getTitheDate() != null) {
                String monthName = t.getTitheDate().getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
                result.merge(monthName, t.getAmount(), BigDecimal::add);
            }
        }

        return result;
    }

    public List<Map<String, Object>> getTopDonors(Long churchId, LocalDate from, LocalDate to, int limit) {
        Map<Long, BigDecimal> memberTotals = new HashMap<>();
        Map<Long, String> memberNames = new HashMap<>();

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to);
        for (Donation d : donations) {
            if (d.getMember() != null) {
                Long memberId = d.getMember().getId();
                memberTotals.merge(memberId, d.getAmount(), BigDecimal::add);
                memberNames.putIfAbsent(memberId, d.getMember().getFirstName() + " " + d.getMember().getLastName());
            }
        }

        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, from, to);
        for (Tithe t : tithes) {
            if (t.getMember() != null) {
                Long memberId = t.getMember().getId();
                memberTotals.merge(memberId, t.getAmount(), BigDecimal::add);
                memberNames.putIfAbsent(memberId, t.getMember().getFirstName() + " " + t.getMember().getLastName());
            }
        }

        return memberTotals.entrySet().stream()
                .sorted(Map.Entry.<Long, BigDecimal>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Map<String, Object> donor = new LinkedHashMap<>();
                    donor.put("memberId", entry.getKey());
                    donor.put("name", memberNames.get(entry.getKey()));
                    donor.put("totalGiven", entry.getValue());
                    return donor;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Long> getDonationSizeDistribution(Long churchId, LocalDate from, LocalDate to) {
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("$0-50", 0L);
        distribution.put("$50-100", 0L);
        distribution.put("$100-250", 0L);
        distribution.put("$250-500", 0L);
        distribution.put("$500-1000", 0L);
        distribution.put("$1000+", 0L);

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to);
        for (Donation d : donations) {
            categorizeAmount(d.getAmount(), distribution);
        }

        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, from, to);
        for (Tithe t : tithes) {
            categorizeAmount(t.getAmount(), distribution);
        }

        return distribution;
    }

    private void categorizeAmount(BigDecimal amount, Map<String, Long> distribution) {
        double val = amount.doubleValue();
        if (val < 50) {
            distribution.merge("$0-50", 1L, Long::sum);
        } else if (val < 100) {
            distribution.merge("$50-100", 1L, Long::sum);
        } else if (val < 250) {
            distribution.merge("$100-250", 1L, Long::sum);
        } else if (val < 500) {
            distribution.merge("$250-500", 1L, Long::sum);
        } else if (val < 1000) {
            distribution.merge("$500-1000", 1L, Long::sum);
        } else {
            distribution.merge("$1000+", 1L, Long::sum);
        }
    }

    public Map<String, Long> getGivingFrequencyDistribution(Long churchId, LocalDate from, LocalDate to) {
        long totalDays = ChronoUnit.DAYS.between(from, to) + 1;

        Map<Long, Integer> donorGivingDays = new HashMap<>();

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to);
        for (Donation d : donations) {
            if (d.getMember() != null) {
                donorGivingDays.merge(d.getMember().getId(), 1, Integer::sum);
            }
        }

        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, from, to);
        for (Tithe t : tithes) {
            if (t.getMember() != null) {
                donorGivingDays.merge(t.getMember().getId(), 1, Integer::sum);
            }
        }

        Map<String, Long> frequencyDist = new LinkedHashMap<>();
        frequencyDist.put("Weekly", 0L);
        frequencyDist.put("Bi-Weekly", 0L);
        frequencyDist.put("Monthly", 0L);
        frequencyDist.put("Quarterly", 0L);
        frequencyDist.put("Occasional", 0L);

        for (Integer count : donorGivingDays.values()) {
            double frequencyPerWeek = (double) count / (totalDays / 7.0);

            if (frequencyPerWeek >= 0.8) {
                frequencyDist.merge("Weekly", 1L, Long::sum);
            } else if (frequencyPerWeek >= 0.4) {
                frequencyDist.merge("Bi-Weekly", 1L, Long::sum);
            } else if (frequencyPerWeek >= 0.2) {
                frequencyDist.merge("Monthly", 1L, Long::sum);
            } else if (frequencyPerWeek >= 0.07) {
                frequencyDist.merge("Quarterly", 1L, Long::sum);
            } else {
                frequencyDist.merge("Occasional", 1L, Long::sum);
            }
        }

        return frequencyDist;
    }

    public BigDecimal getAverageGiftSize(Long churchId, LocalDate from, LocalDate to) {
        BigDecimal totalDonations = donationRepository.sumByChurchIdAndDateRange(churchId, from, to);
        BigDecimal totalTithes = titheRepository.sumByChurchIdAndDateRange(churchId, from, to);
        BigDecimal totalAmount = totalDonations.add(totalTithes);

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, from, to);
        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, from, to);

        int totalCount = donations.size() + tithes.size();

        if (totalCount == 0) {
            return BigDecimal.ZERO;
        }

        return totalAmount.divide(BigDecimal.valueOf(totalCount), 2, RoundingMode.HALF_UP);
    }

    public Map<String, Object> getRetentionVsFrequency(Long churchId) {
        LocalDate now = LocalDate.now();
        LocalDate threeMonthsAgo = now.minusMonths(3);
        LocalDate sixMonthsAgo = now.minusMonths(6);

        Map<Long, Integer> givingFrequency = new HashMap<>();
        Map<Long, BigDecimal> givingAmounts = new HashMap<>();

        List<Donation> donations = donationRepository.findByChurchIdAndDonationDateBetween(churchId, sixMonthsAgo, now);
        for (Donation d : donations) {
            if (d.getMember() != null) {
                Long memberId = d.getMember().getId();
                givingFrequency.merge(memberId, 1, Integer::sum);
                givingAmounts.merge(memberId, d.getAmount(), BigDecimal::add);
            }
        }

        List<Tithe> tithes = titheRepository.findByChurchIdAndTitheDateBetween(churchId, sixMonthsAgo, now);
        for (Tithe t : tithes) {
            if (t.getMember() != null) {
                Long memberId = t.getMember().getId();
                givingFrequency.merge(memberId, 1, Integer::sum);
                givingAmounts.merge(memberId, t.getAmount(), BigDecimal::add);
            }
        }

        long totalDonors = givingFrequency.size();
        long activeDonors = givingFrequency.entrySet().stream()
                .filter(e -> e.getValue() >= 2)
                .count();

        BigDecimal retentionRate = totalDonors > 0
                ? BigDecimal.valueOf(activeDonors)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalDonors), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgFrequencyPerDonor = totalDonors > 0
                ? BigDecimal.valueOf(givingFrequency.values().stream().mapToInt(Integer::intValue).sum())
                    .divide(BigDecimal.valueOf(totalDonors), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgAmountPerDonor = totalDonors > 0
                ? givingAmounts.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(totalDonors), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalDonors", totalDonors);
        result.put("activeDonors", activeDonors);
        result.put("retentionRate", retentionRate);
        result.put("averageFrequencyPerDonor", avgFrequencyPerDonor);
        result.put("averageAmountPerDonor", avgAmountPerDonor);
        return result;
    }
}
