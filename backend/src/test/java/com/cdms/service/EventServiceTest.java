package com.cdms.service;

import com.cdms.dto.*;
import com.cdms.entity.*;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    private Event event;

    @BeforeEach
    void setUp() {
        event = new Event();
        event.setId(1L);
        event.setTitle("Sunday Service");
        event.setDescription("Weekly worship service");
        event.setEventDate(LocalDate.now().plusDays(7));
        event.setLocation("Main Sanctuary");
    }

    @Test
    void getAllEvents_Success() {
        when(eventRepository.findAll()).thenReturn(Arrays.asList(event));

        List<EventDto> result = eventService.getAllEvents();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Sunday Service");
    }

    @Test
    void getEventById_Success() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        EventDto result = eventService.getEventById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Sunday Service");
    }

    @Test
    void getEventById_NotFound_ThrowsException() {
        when(eventRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.getEventById(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Event not found");
    }

    @Test
    void createEvent_Success() {
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventDto dto = new EventDto();
        dto.setTitle("Sunday Service");
        dto.setEventDate(LocalDate.now().plusDays(7));
        dto.setLocation("Main Sanctuary");

        EventDto result = eventService.createEvent(dto);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Sunday Service");
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void updateEvent_Success() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(eventRepository.save(any(Event.class))).thenReturn(event);

        EventDto dto = new EventDto();
        dto.setTitle("Updated Service");
        dto.setEventDate(LocalDate.now().plusDays(14));

        EventDto result = eventService.updateEvent(1L, dto);

        assertThat(result).isNotNull();
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void deleteEvent_Success() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        eventService.deleteEvent(1L);

        verify(eventRepository, times(1)).delete(event);
    }

    @Test
    void getUpcomingEvents_Success() {
        when(eventRepository.findUpcomingEvents(LocalDate.now())).thenReturn(Arrays.asList(event));

        List<EventDto> result = eventService.getUpcomingEvents();

        assertThat(result).hasSize(1);
    }
}
