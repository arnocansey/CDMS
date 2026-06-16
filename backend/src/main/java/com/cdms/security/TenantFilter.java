package com.cdms.security;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.hibernate.Filter;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Component
public class TenantFilter {

    @PersistenceContext
    private EntityManager entityManager;

    public void enableFilter(Long churchId) {
        Session session = entityManager.unwrap(Session.class);
        Filter filter = session.enableFilter("tenantFilter");
        filter.setParameter("churchId", churchId);
    }

    public void disableFilter() {
        Session session = entityManager.unwrap(Session.class);
        session.disableFilter("tenantFilter");
    }
}
