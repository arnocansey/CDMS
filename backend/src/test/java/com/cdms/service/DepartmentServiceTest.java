package com.cdms.service;

import com.cdms.dto.DepartmentDto;
import com.cdms.entity.Department;
import com.cdms.entity.Member;
import com.cdms.exception.BadRequestException;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.DepartmentRepository;
import com.cdms.repository.MemberRepository;
import com.cdms.security.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private DepartmentService departmentService;

    private Department department;
    private Member leader;

    @BeforeEach
    void setUp() {
        TenantContext.setChurchId(1L);

        leader = new Member();
        leader.setId(1L);
        leader.setChurchId(1L);
        leader.setFirstName("Jane");
        leader.setLastName("Leader");

        department = new Department();
        department.setId(1L);
        department.setChurchId(1L);
        department.setName("Youth Department");
        department.setDescription("Youth ministry programs");
        department.setLeader(leader);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void getAllDepartments_Success() {
        when(departmentRepository.findByChurchId(1L)).thenReturn(Arrays.asList(department));

        List<DepartmentDto> result = departmentService.getAllDepartments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Youth Department");
    }

    @Test
    void getAllDepartments_NoChurchContext_ThrowsBadRequest() {
        TenantContext.clear();

        assertThatThrownBy(() -> departmentService.getAllDepartments())
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("No church context set");
    }

    @Test
    void getDepartmentById_Success() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        DepartmentDto result = departmentService.getDepartmentById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Youth Department");
    }

    @Test
    void getDepartmentById_NotFound_ThrowsException() {
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.getDepartmentById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Department not found with id: 999");
    }

    @Test
    void createDepartment_Success() {
        when(departmentRepository.existsByNameAndChurchId("Youth Department", 1L)).thenReturn(false);
        when(memberRepository.findById(1L)).thenReturn(Optional.of(leader));
        when(departmentRepository.save(any(Department.class))).thenReturn(department);

        DepartmentDto dto = new DepartmentDto();
        dto.setName("Youth Department");
        dto.setDescription("Youth ministry programs");
        dto.setLeaderId(1L);

        DepartmentDto result = departmentService.createDepartment(dto);

        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Youth Department");
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void createDepartment_DuplicateName_ThrowsException() {
        when(departmentRepository.existsByNameAndChurchId("Youth Department", 1L)).thenReturn(true);

        DepartmentDto dto = new DepartmentDto();
        dto.setName("Youth Department");
        dto.setDescription("Youth ministry programs");

        assertThatThrownBy(() -> departmentService.createDepartment(dto))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Department name already exists");
    }

    @Test
    void updateDepartment_Success() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(departmentRepository.save(any(Department.class))).thenReturn(department);

        DepartmentDto dto = new DepartmentDto();
        dto.setName("Updated Youth Department");
        dto.setDescription("Updated description");

        DepartmentDto result = departmentService.updateDepartment(1L, dto);

        assertThat(result).isNotNull();
        verify(departmentRepository, times(1)).save(any(Department.class));
    }

    @Test
    void updateDepartment_NotFound_ThrowsException() {
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        DepartmentDto dto = new DepartmentDto();
        dto.setName("Updated");

        assertThatThrownBy(() -> departmentService.updateDepartment(999L, dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Department not found with id: 999");
    }

    @Test
    void deleteDepartment_Success() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));

        departmentService.deleteDepartment(1L);

        verify(departmentRepository, times(1)).delete(department);
    }

    @Test
    void deleteDepartment_NotFound_ThrowsException() {
        when(departmentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.deleteDepartment(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Department not found with id: 999");
    }
}
