-- V21: Remove demo/seed data while retaining real churches and system catalogs.
-- Targets: Default Church (slug=default) + @gracechurch.org seed users + V4 demo members.
-- Keeps: roles, subscription_plans, and all non-demo churches/users/data.

-- ---------------------------------------------------------------------------
-- 1) Clear dependent rows for known demo members (V4 emails), any church
-- ---------------------------------------------------------------------------
WITH demo_members AS (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
)
DELETE FROM goal_contributions WHERE member_id IN (SELECT id FROM demo_members);

WITH demo_members AS (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
)
DELETE FROM pledge_payments WHERE pledge_id IN (
    SELECT id FROM pledges WHERE member_id IN (SELECT id FROM demo_members)
);

WITH demo_members AS (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
)
DELETE FROM pledges WHERE member_id IN (SELECT id FROM demo_members);

WITH demo_members AS (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
)
DELETE FROM receipts WHERE member_id IN (SELECT id FROM demo_members);

WITH demo_members AS (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
)
DELETE FROM donations WHERE member_id IN (SELECT id FROM demo_members);

WITH demo_members AS (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
)
DELETE FROM tithes WHERE member_id IN (SELECT id FROM demo_members);

WITH demo_members AS (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
)
DELETE FROM church_transfers WHERE member_id IN (SELECT id FROM demo_members);

UPDATE departments SET leader_id = NULL
WHERE leader_id IN (
    SELECT id FROM members WHERE email IN (
        'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
        'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
        'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
        'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
        'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
    )
);

DELETE FROM members WHERE email IN (
    'grace.j@email.com', 'daniel.w@email.com', 'olivia.b@email.com', 'ethan.d@email.com',
    'sophia.m@email.com', 'alexander.w@email.com', 'isabella.m@email.com', 'william.t@email.com',
    'mia.a@email.com', 'james.t@email.com', 'charlotte.j@email.com', 'benjamin.w@email.com',
    'amelia.h@email.com', 'lucas.m@email.com', 'harper.g@email.com', 'henry.m@email.com',
    'evelyn.r@email.com', 'sebastian.c@email.com', 'abigail.r@email.com', 'jack.l@email.com'
);

-- ---------------------------------------------------------------------------
-- 2) Remove seed users (@gracechurch.org)
-- ---------------------------------------------------------------------------
DELETE FROM two_factor_auth WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@gracechurch.org'
);
DELETE FROM push_subscriptions WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@gracechurch.org'
);
DELETE FROM notifications WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@gracechurch.org'
);
DELETE FROM audit_logs WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@gracechurch.org'
);
DELETE FROM user_roles WHERE user_id IN (
    SELECT id FROM users WHERE email LIKE '%@gracechurch.org'
);
DELETE FROM users WHERE email LIKE '%@gracechurch.org';

-- ---------------------------------------------------------------------------
-- 3) Wipe remaining data for the seeded Default Church only
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    demo_id BIGINT;
BEGIN
    SELECT id INTO demo_id
    FROM churches
    WHERE slug = 'default'
       OR email = 'admin@defaultchurch.org'
    LIMIT 1;

    IF demo_id IS NULL THEN
        RETURN;
    END IF;

    -- Detach users / FKs that block deletes
    UPDATE users SET church_id = NULL, branch_id = NULL, district_id = NULL WHERE church_id = demo_id;
    UPDATE departments SET leader_id = NULL WHERE church_id = demo_id;

    DELETE FROM reconciliation_entries WHERE church_id = demo_id;
    DELETE FROM bank_reconciliations WHERE church_id = demo_id;
    DELETE FROM goal_contributions WHERE church_id = demo_id;
    DELETE FROM pledge_payments WHERE church_id = demo_id;
    DELETE FROM pledges WHERE church_id = demo_id;
    DELETE FROM financial_goals WHERE church_id = demo_id;
    DELETE FROM fund_transactions WHERE church_id = demo_id;
    DELETE FROM funds WHERE church_id = demo_id;
    DELETE FROM receipts WHERE church_id = demo_id;
    DELETE FROM cash_flow_entries WHERE church_id = demo_id;
    DELETE FROM donations WHERE church_id = demo_id;
    DELETE FROM tithes WHERE church_id = demo_id;
    DELETE FROM offerings WHERE church_id = demo_id;
    DELETE FROM expenses WHERE church_id = demo_id;
    DELETE FROM budgets WHERE church_id = demo_id;
    DELETE FROM budget_forecasts WHERE church_id = demo_id;
    DELETE FROM donor_retention WHERE church_id = demo_id;
    DELETE FROM forecasts WHERE created_by LIKE '%@gracechurch.org';
    DELETE FROM attendance WHERE church_id = demo_id;
    DELETE FROM prayer_requests WHERE church_id = demo_id;
    DELETE FROM events WHERE church_id = demo_id;
    DELETE FROM announcements WHERE church_id = demo_id;
    DELETE FROM departments WHERE church_id = demo_id;
    DELETE FROM members WHERE church_id = demo_id;
    DELETE FROM visitors WHERE church_id = demo_id;
    DELETE FROM recurring_donations WHERE church_id = demo_id;
    DELETE FROM recurring_expenses WHERE church_id = demo_id;
    DELETE FROM church_transfers WHERE from_church_id = demo_id OR to_church_id = demo_id;
    DELETE FROM import_jobs WHERE church_id = demo_id;
    DELETE FROM api_keys WHERE church_id = demo_id;
    DELETE FROM email_digests WHERE church_id = demo_id;
    DELETE FROM push_subscriptions WHERE church_id = demo_id;
    DELETE FROM payment_transactions WHERE church_id = demo_id;
    DELETE FROM church_subscriptions WHERE church_id = demo_id;
    DELETE FROM permissions WHERE church_id = demo_id;
    DELETE FROM notifications WHERE church_id = demo_id;
    DELETE FROM audit_logs WHERE church_id = demo_id;
    DELETE FROM branches WHERE church_id = demo_id;
    DELETE FROM districts WHERE church_id = demo_id;

    DELETE FROM churches WHERE id = demo_id;
END $$;
