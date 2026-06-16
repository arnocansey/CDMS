package com.cdms.service;

import com.cdms.entity.Visitor;
import com.cdms.entity.User;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.VisitorRepository;
import com.cdms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VisitorService {

    private final VisitorRepository visitorRepository;
    private final UserRepository userRepository;

    public VisitorService(VisitorRepository visitorRepository, UserRepository userRepository) {
        this.visitorRepository = visitorRepository;
        this.userRepository = userRepository;
    }

    public Visitor recordVisit(Visitor visitor, Long churchId) {
        visitor.setChurchId(churchId);

        if (visitor.getVisitDate() == null) {
            visitor.setVisitDate(LocalDate.now());
        }

        if (visitor.getEmail() != null) {
            Optional<Visitor> existingOpt = visitorRepository.findByChurchIdAndEmail(churchId, visitor.getEmail());
            if (existingOpt.isPresent()) {
                Visitor existing = existingOpt.get();
                existing.setVisitCount(existing.getVisitCount() + 1);
                existing.setVisitDate(visitor.getVisitDate());
                existing.setFollowUpStatus("NONE");
                existing.setFollowUpDate(null);
                existing.setFollowUpNotes(null);

                if (existing.getVisitCount() == 2) {
                    existing.setStatus("RETURNING");
                } else if (existing.getVisitCount() >= 3) {
                    existing.setStatus("REGULAR");
                }

                if (visitor.getNotes() != null) {
                    existing.setNotes(visitor.getNotes());
                }
                if (visitor.getReferredBy() != null) {
                    existing.setReferredBy(visitor.getReferredBy());
                }
                if (visitor.isInterestedInMembership()) {
                    existing.setInterestedInMembership(true);
                }
                if (visitor.getPhone() != null) {
                    existing.setPhone(visitor.getPhone());
                }
                if (visitor.getAddress() != null) {
                    existing.setAddress(visitor.getAddress());
                }

                return visitorRepository.save(existing);
            }
        }

        if (visitor.getFirstVisitDate() == null) {
            visitor.setFirstVisitDate(visitor.getVisitDate());
        }
        if (visitor.getStatus() == null) {
            visitor.setStatus("FIRST_TIME");
        }
        if (visitor.getVisitCount() == null) {
            visitor.setVisitCount(1);
        }
        if (visitor.getFollowUpStatus() == null) {
            visitor.setFollowUpStatus("NONE");
        }

        return visitorRepository.save(visitor);
    }

    public List<Visitor> getVisitors(Long churchId, LocalDate from, LocalDate to) {
        if (from != null && to != null) {
            return visitorRepository.findByChurchIdAndVisitDateBetween(churchId, from, to);
        }
        return visitorRepository.findByChurchId(churchId);
    }

    public Map<String, Object> getVisitorStats(Long churchId) {
        List<Visitor> allVisitors = visitorRepository.findByChurchId(churchId);

        long totalVisitors = allVisitors.size();
        long firstTime = allVisitors.stream().filter(v -> "FIRST_TIME".equals(v.getStatus())).count();
        long returning = allVisitors.stream().filter(v -> "RETURNING".equals(v.getStatus())).count();
        long regular = allVisitors.stream().filter(v -> "REGULAR".equals(v.getStatus())).count();
        long converted = allVisitors.stream().filter(v -> "MEMBER_CONVERT".equals(v.getStatus())).count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalVisitors", totalVisitors);
        stats.put("firstTime", firstTime);
        stats.put("returning", returning);
        stats.put("regular", regular);
        stats.put("converted", converted);
        return stats;
    }

    public List<Map<String, Object>> getVisitorTrend(Long churchId, int months) {
        List<Map<String, Object>> trend = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = months - 1; i >= 0; i--) {
            YearMonth month = currentMonth.minusMonths(i);
            LocalDate from = month.atDay(1);
            LocalDate to = month.atEndOfMonth();

            long count = visitorRepository.countByChurchIdAndVisitDateBetween(churchId, from, to);

            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", month.format(formatter));
            entry.put("count", count);
            trend.add(entry);
        }

        return trend;
    }

    public Visitor updateFollowUp(Long visitorId, String status, String notes) {
        Visitor visitor = visitorRepository.findById(visitorId)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor", visitorId));
        visitor.setFollowUpStatus(status);
        if (notes != null) {
            visitor.setFollowUpNotes(notes);
        }
        if ("SCHEDULED".equals(status)) {
            visitor.setFollowUpDate(LocalDate.now());
        }
        return visitorRepository.save(visitor);
    }

    public List<Visitor> getFollowUpList(Long churchId) {
        return visitorRepository.findByChurchId(churchId).stream()
                .filter(v -> !"NONE".equals(v.getFollowUpStatus()) && !"COMPLETED".equals(v.getFollowUpStatus()))
                .sorted(Comparator.comparing(Visitor::getFollowUpStatus))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getVisitorRetentionRate(Long churchId) {
        List<Visitor> allVisitors = visitorRepository.findByChurchId(churchId);
        long total = allVisitors.size();
        long returned = allVisitors.stream().filter(v -> v.getVisitCount() > 1).count();

        double retentionRate = total > 0 ? (double) returned / total * 100 : 0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalVisitors", total);
        result.put("returningVisitors", returned);
        result.put("retentionRate", Math.round(retentionRate * 100.0) / 100.0);
        return result;
    }
}
