package com.cdms.service;

import com.cdms.dto.DepartmentDto;
import com.cdms.entity.Department;
import com.cdms.entity.Member;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.DepartmentRepository;
import com.cdms.repository.MemberRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final MemberRepository memberRepository;

    public DepartmentService(DepartmentRepository departmentRepository, MemberRepository memberRepository) {
        this.departmentRepository = departmentRepository;
        this.memberRepository = memberRepository;
    }

    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        return mapToDto(department);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        if (departmentRepository.existsByName(departmentDto.getName())) {
            throw new BadRequestException("Department name already exists");
        }

        Department department = new Department();
        department.setChurchId(TenantContext.getChurchId());
        department.setName(departmentDto.getName());
        department.setDescription(departmentDto.getDescription());

        if (departmentDto.getLeaderId() != null) {
            Member leader = memberRepository.findById(departmentDto.getLeaderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member", departmentDto.getLeaderId()));
            department.setLeader(leader);
        }

        Department savedDepartment = departmentRepository.save(department);
        return mapToDto(savedDepartment);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto departmentDto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));

        department.setName(departmentDto.getName());
        department.setDescription(departmentDto.getDescription());

        if (departmentDto.getLeaderId() != null) {
            Member leader = memberRepository.findById(departmentDto.getLeaderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member", departmentDto.getLeaderId()));
            department.setLeader(leader);
        }

        Department updatedDepartment = departmentRepository.save(department);
        return mapToDto(updatedDepartment);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
        departmentRepository.delete(department);
    }

    private DepartmentDto mapToDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        if (department.getLeader() != null) {
            dto.setLeaderId(department.getLeader().getId());
            dto.setLeaderName(department.getLeader().getFirstName() + " " + department.getLeader().getLastName());
        }
        return dto;
    }
}
