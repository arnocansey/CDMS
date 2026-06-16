package com.cdms.repository;

import com.cdms.entity.GoalContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalContributionRepository extends JpaRepository<GoalContribution, Long> {
    List<GoalContribution> findByGoalId(Long goalId);
    List<GoalContribution> findByGoalIdOrderByContributionDateDesc(Long goalId);
    List<GoalContribution> findByMemberId(Long memberId);
}
