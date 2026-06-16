package com.cdms.service;

import com.cdms.repository.BudgetRepository;
import com.cdms.repository.ChurchRepository;
import com.cdms.repository.DonationRepository;
import com.cdms.repository.ExpenseRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.repository.TitheRepository;
import com.cdms.entity.Church;
import com.cdms.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChurchComparisonService {

    private final ChurchRepository churchRepository;
    private final MemberRepository memberRepository;
    private final DonationRepository donationRepository;
    private final ExpenseRepository expenseRepository;
    private final TitheRepository titheRepository;
    private final BudgetRepository budgetRepository;

    public ChurchComparisonService(ChurchRepository churchRepository,
                                   MemberRepository memberRepository,
                                   DonationRepository donationRepository,
                                   ExpenseRepository expenseRepository,
                                   TitheRepository titheRepository,
                                   BudgetRepository budgetRepository) {
        this.churchRepository = churchRepository;
        this.memberRepository = memberRepository;
        this.donationRepository = donationRepository;
        this.expenseRepository = expenseRepository;
        this.titheRepository = titheRepository;
        this.budgetRepository = budgetRepository;
    }

    public Map<String, Object> getChurchMetrics(Long churchId) {
        Church church = churchRepository.findById(churchId)
                .orElseThrow(() -> new ResourceNotFoundException("Church", churchId));

        YearMonth now = YearMonth.now();
        LocalDate yearStart = now.atDay(1);
        LocalDate yearEnd = now.atEndOfMonth();
        LocalDate lastYearStart = now.minusYears(1).atDay(1);
        LocalDate lastYearEnd = now.minusYears(1).atEndOfMonth();

        long totalMembers = memberRepository.findByChurchId(churchId).size();
        long activeMembers = memberRepository.countActiveMembersByChurchId(churchId);

        BigDecimal totalDonationsYTD = donationRepository.sumByChurchIdAndDateRange(churchId, yearStart, yearEnd)
                .add(titheRepository.sumByChurchIdAndDateRange(churchId, yearStart, yearEnd));
        BigDecimal totalExpensesYTD = expenseRepository.sumByChurchIdAndDateRange(churchId, yearStart, yearEnd);
        BigDecimal netIncome = totalDonationsYTD.subtract(totalExpensesYTD);

        BigDecimal totalGivingYTD = donationRepository.sumByChurchIdAndDateRange(churchId, yearStart, yearEnd)
                .add(titheRepository.sumByChurchIdAndDateRange(churchId, yearStart, yearEnd));
        long donationCount = donationRepository.findByChurchIdAndDonationDateBetween(churchId, yearStart, yearEnd).size()
                + titheRepository.findByChurchIdAndTitheDateBetween(churchId, yearStart, yearEnd).size();
        BigDecimal averageGiftSize = donationCount > 0
                ? totalGivingYTD.divide(BigDecimal.valueOf(donationCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal lastYearDonations = donationRepository.sumByChurchIdAndDateRange(churchId, lastYearStart, lastYearEnd)
                .add(titheRepository.sumByChurchIdAndDateRange(churchId, lastYearStart, lastYearEnd));
        BigDecimal donationGrowthRate = lastYearDonations.compareTo(BigDecimal.ZERO) != 0
                ? totalDonationsYTD.subtract(lastYearDonations)
                    .divide(lastYearDonations.abs(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        BigDecimal lastYearExpenses = expenseRepository.sumByChurchIdAndDateRange(churchId, lastYearStart, lastYearEnd);
        BigDecimal expenseGrowthRate = lastYearExpenses.compareTo(BigDecimal.ZERO) != 0
                ? totalExpensesYTD.subtract(lastYearExpenses)
                    .divide(lastYearExpenses.abs(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        long lastYearMembers = memberRepository.findByChurchId(churchId).stream()
                .filter(m -> m.getMembershipDate() != null && !m.getMembershipDate().isAfter(lastYearEnd))
                .count();
        BigDecimal memberGrowthRate = lastYearMembers > 0
                ? BigDecimal.valueOf(totalMembers - lastYearMembers)
                    .divide(BigDecimal.valueOf(lastYearMembers), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("churchId", churchId);
        metrics.put("churchName", church.getName());
        metrics.put("totalMembers", totalMembers);
        metrics.put("activeMembers", activeMembers);
        metrics.put("totalDonationsYTD", totalDonationsYTD);
        metrics.put("totalExpensesYTD", totalExpensesYTD);
        metrics.put("netIncome", netIncome);
        metrics.put("averageGiftSize", averageGiftSize);
        metrics.put("donationGrowthRate", donationGrowthRate.setScale(2, RoundingMode.HALF_UP));
        metrics.put("expenseGrowthRate", expenseGrowthRate.setScale(2, RoundingMode.HALF_UP));
        metrics.put("memberGrowthRate", memberGrowthRate.setScale(2, RoundingMode.HALF_UP));

        return metrics;
    }

    public List<Map<String, Object>> compareChurches(List<Long> churchIds) {
        List<Map<String, Object>> results = new ArrayList<>();
        for (Long churchId : churchIds) {
            results.add(getChurchMetrics(churchId));
        }
        return results;
    }

    public List<Map<String, Object>> getTopChurchesByGiving(int limit) {
        YearMonth now = YearMonth.now();
        LocalDate yearStart = now.atDay(1);
        LocalDate yearEnd = now.atEndOfMonth();

        List<Church> churches = churchRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        for (Church church : churches) {
            BigDecimal totalGiving = donationRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd)
                    .add(titheRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd));

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("churchId", church.getId());
            entry.put("churchName", church.getName());
            entry.put("totalGiving", totalGiving);
            results.add(entry);
        }

        return results.stream()
                .sorted(Comparator.comparing(e -> ((BigDecimal) e.get("totalGiving")).negate()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getTopChurchesByGrowth(int limit) {
        List<Church> churches = churchRepository.findAll();
        List<Map<String, Object>> results = new ArrayList<>();

        for (Church church : churches) {
            long currentMembers = memberRepository.countActiveMembersByChurchId(church.getId());
            LocalDate oneYearAgo = YearMonth.now().minusYears(1).atEndOfMonth();
            long pastMembers = memberRepository.findByChurchId(church.getId()).stream()
                    .filter(m -> m.getMembershipDate() != null && !m.getMembershipDate().isAfter(oneYearAgo))
                    .count();

            BigDecimal growthRate = pastMembers > 0
                    ? BigDecimal.valueOf(currentMembers - pastMembers)
                        .divide(BigDecimal.valueOf(pastMembers), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                    : BigDecimal.ZERO;

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("churchId", church.getId());
            entry.put("churchName", church.getName());
            entry.put("currentMembers", currentMembers);
            entry.put("pastMembers", pastMembers);
            entry.put("growthRate", growthRate.setScale(2, RoundingMode.HALF_UP));
            results.add(entry);
        }

        return results.stream()
                .sorted(Comparator.comparing(e -> ((BigDecimal) e.get("growthRate")).negate()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getPlatformOverview() {
        List<Church> churches = churchRepository.findAll();
        long totalChurches = churches.size();
        long totalMembers = 0;
        BigDecimal totalGiving = BigDecimal.ZERO;
        BigDecimal totalExpenses = BigDecimal.ZERO;

        YearMonth now = YearMonth.now();
        LocalDate yearStart = now.atDay(1);
        LocalDate yearEnd = now.atEndOfMonth();

        for (Church church : churches) {
            totalMembers += memberRepository.countActiveMembersByChurchId(church.getId());
            totalGiving = totalGiving.add(
                    donationRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd)
                            .add(titheRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd)));
            totalExpenses = totalExpenses.add(
                    expenseRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd));
        }

        Map<String, Object> overview = new LinkedHashMap<>();
        overview.put("totalChurches", totalChurches);
        overview.put("totalMembers", totalMembers);
        overview.put("totalGiving", totalGiving);
        overview.put("totalExpenses", totalExpenses);
        overview.put("netIncome", totalGiving.subtract(totalExpenses));

        return overview;
    }

    public Map<Long, Map<String, Object>> getChurchHealthScores() {
        List<Church> churches = churchRepository.findAll();
        Map<Long, Map<String, Object>> healthScores = new LinkedHashMap<>();

        for (Church church : churches) {
            healthScores.put(church.getId(), calculateHealthScore(church));
        }

        return healthScores;
    }

    private Map<String, Object> calculateHealthScore(Church church) {
        YearMonth now = YearMonth.now();
        LocalDate yearStart = now.atDay(1);
        LocalDate yearEnd = now.atEndOfMonth();
        LocalDate lastYearStart = now.minusYears(1).atDay(1);
        LocalDate lastYearEnd = now.minusYears(1).atEndOfMonth();

        int score = 0;
        Map<String, Object> breakdown = new LinkedHashMap<>();

        BigDecimal currentGiving = donationRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd)
                .add(titheRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd));
        BigDecimal lastGiving = donationRepository.sumByChurchIdAndDateRange(church.getId(), lastYearStart, lastYearEnd)
                .add(titheRepository.sumByChurchIdAndDateRange(church.getId(), lastYearStart, lastYearEnd));

        if (lastGiving.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal givingGrowth = currentGiving.subtract(lastGiving)
                    .divide(lastGiving, 4, RoundingMode.HALF_UP);
            if (givingGrowth.compareTo(BigDecimal.ZERO) > 0) {
                score += 25;
            } else if (givingGrowth.compareTo(new BigDecimal("-0.1")) > 0) {
                score += 15;
            } else {
                score += 5;
            }
            breakdown.put("givingTrend", givingGrowth.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        } else {
            score += 10;
            breakdown.put("givingTrend", BigDecimal.ZERO);
        }

        long currentMembers = memberRepository.countActiveMembersByChurchId(church.getId());
        long pastMembers = memberRepository.findByChurchId(church.getId()).stream()
                .filter(m -> m.getMembershipDate() != null && !m.getMembershipDate().isAfter(lastYearEnd))
                .count();
        if (pastMembers > 0) {
            BigDecimal memberGrowth = BigDecimal.valueOf(currentMembers - pastMembers)
                    .divide(BigDecimal.valueOf(pastMembers), 4, RoundingMode.HALF_UP);
            if (memberGrowth.compareTo(BigDecimal.ZERO) > 0) {
                score += 25;
            } else if (memberGrowth.compareTo(new BigDecimal("-0.05")) > 0) {
                score += 15;
            } else {
                score += 5;
            }
            breakdown.put("memberRetention", memberGrowth.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        } else {
            score += 10;
            breakdown.put("memberRetention", BigDecimal.ZERO);
        }

        BigDecimal totalBudgeted = budgetRepository.findByChurchId(church.getId()).stream()
                .filter(b -> b.getPeriod() != null && b.getPeriod().contains(String.valueOf(now.getYear())))
                .map(b -> b.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSpent = budgetRepository.findByChurchId(church.getId()).stream()
                .filter(b -> b.getPeriod() != null && b.getPeriod().contains(String.valueOf(now.getYear())))
                .map(b -> b.getSpent())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalBudgeted.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal utilization = totalSpent.divide(totalBudgeted, 4, RoundingMode.HALF_UP);
            if (utilization.compareTo(new BigDecimal("0.9")) <= 0 && utilization.compareTo(new BigDecimal("0.5")) >= 0) {
                score += 25;
            } else if (utilization.compareTo(new BigDecimal("1.1")) <= 0) {
                score += 15;
            } else {
                score += 5;
            }
            breakdown.put("budgetCompliance", utilization.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        } else {
            score += 10;
            breakdown.put("budgetCompliance", BigDecimal.ZERO);
        }

        BigDecimal currentExpenses = expenseRepository.sumByChurchIdAndDateRange(church.getId(), yearStart, yearEnd);
        BigDecimal lastExpenses = expenseRepository.sumByChurchIdAndDateRange(church.getId(), lastYearStart, lastYearEnd);
        if (lastExpenses.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal expenseGrowth = currentExpenses.subtract(lastExpenses)
                    .divide(lastExpenses, 4, RoundingMode.HALF_UP);
            if (expenseGrowth.compareTo(new BigDecimal("0.1")) < 0) {
                score += 25;
            } else if (expenseGrowth.compareTo(new BigDecimal("0.2")) < 0) {
                score += 15;
            } else {
                score += 5;
            }
            breakdown.put("expenseControl", expenseGrowth.multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP));
        } else {
            score += 25;
            breakdown.put("expenseControl", BigDecimal.ZERO);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("healthScore", Math.min(100, score));
        result.put("breakdown", breakdown);
        result.put("churchName", church.getName());

        return result;
    }
}
