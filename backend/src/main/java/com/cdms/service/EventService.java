package com.cdms.service;

import com.cdms.dto.EventDto;
import com.cdms.entity.Event;
import com.cdms.exception.ResourceNotFoundException;
import com.cdms.repository.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.cdms.security.TenantContext;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<EventDto> getAllEvents() {
        Long churchId = TenantContext.requireChurchId();
        return eventRepository.findByChurchId(churchId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getUpcomingEvents() {
        Long churchId = TenantContext.requireChurchId();
        return eventRepository.findUpcomingEventsByChurchId(churchId, LocalDate.now()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<EventDto> getEventsByDateRange(LocalDate startDate, LocalDate endDate) {
        Long churchId = TenantContext.requireChurchId();
        return eventRepository.findByChurchId(churchId).stream()
                .filter(e -> !e.getEventDate().isBefore(startDate) && !e.getEventDate().isAfter(endDate))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public EventDto getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !event.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Event", id);
        }
        return mapToDto(event);
    }

    @Transactional
    public EventDto createEvent(EventDto eventDto) {
        Event event = new Event();
        event.setChurchId(TenantContext.getChurchId());
        event.setTitle(eventDto.getTitle());
        event.setDescription(eventDto.getDescription());
        event.setEventDate(eventDto.getEventDate());
        event.setStartTime(eventDto.getStartTime());
        event.setEndTime(eventDto.getEndTime());
        event.setLocation(eventDto.getLocation());
        event.setRecurring(eventDto.isRecurring());
        event.setCreatedBy(eventDto.getCreatedBy());

        Event savedEvent = eventRepository.save(event);
        return mapToDto(savedEvent);
    }

    @Transactional
    public EventDto updateEvent(Long id, EventDto eventDto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !event.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Event", id);
        }

        event.setTitle(eventDto.getTitle());
        event.setDescription(eventDto.getDescription());
        event.setEventDate(eventDto.getEventDate());
        event.setStartTime(eventDto.getStartTime());
        event.setEndTime(eventDto.getEndTime());
        event.setLocation(eventDto.getLocation());
        event.setRecurring(eventDto.isRecurring());

        Event updatedEvent = eventRepository.save(event);
        return mapToDto(updatedEvent);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event", id));
        Long churchId = TenantContext.getChurchId();
        if (churchId != null && !event.getChurchId().equals(churchId)) {
            throw new ResourceNotFoundException("Event", id);
        }
        eventRepository.delete(event);
    }

    public long getUpcomingEventsCount() {
        Long churchId = TenantContext.requireChurchId();
        return eventRepository.findUpcomingEventsByChurchId(churchId, LocalDate.now()).size();
    }

    private EventDto mapToDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setEventDate(event.getEventDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setLocation(event.getLocation());
        dto.setRecurring(event.isRecurring());
        dto.setCreatedBy(event.getCreatedBy());
        return dto;
    }
}
