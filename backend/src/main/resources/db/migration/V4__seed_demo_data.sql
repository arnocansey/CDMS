-- V4: Seed Demo Data for CDMS

-- ============================================================
-- USERS (password = bcrypt hash of "password123")
-- ============================================================
INSERT INTO users (email, password, first_name, last_name) VALUES
('admin@gracechurch.org', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'James', 'Wilson'),
('pastor@gracechurch.org', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'David', 'Thompson'),
('treasurer@gracechurch.org', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Sarah', 'Mitchell'),
('secretary@gracechurch.org', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Emily', 'Rodriguez'),
('member@gracechurch.org', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Michael', 'Brown');

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'admin@gracechurch.org' AND r.name = 'ROLE_ADMIN';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'pastor@gracechurch.org' AND r.name = 'ROLE_PASTOR';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'treasurer@gracechurch.org' AND r.name = 'ROLE_TREASURER';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'secretary@gracechurch.org' AND r.name = 'ROLE_SECRETARY';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r WHERE u.email = 'member@gracechurch.org' AND r.name = 'ROLE_MEMBER';

-- ============================================================
-- DEPARTMENTS
-- ============================================================
INSERT INTO departments (name, description) VALUES
('Worship', 'Praise and worship ministry'),
('Youth', 'Youth ministry and programs'),
('Women', 'Women''s ministry and fellowship'),
('Men', 'Men''s ministry and brotherhood'),
('Children', 'Children''s ministry and Sunday school');

-- ============================================================
-- MEMBERS (20 members)
-- ============================================================
INSERT INTO members (first_name, last_name, email, phone, date_of_birth, gender, address, city, state, zip_code, membership_date, active, department_id) VALUES
('Grace', 'Johnson', 'grace.j@email.com', '555-0101', '1985-03-15', 'FEMALE', '123 Oak Street', 'Springfield', 'IL', '62701', '2020-01-15', true, 1),
('Daniel', 'Williams', 'daniel.w@email.com', '555-0102', '1978-07-22', 'MALE', '456 Maple Avenue', 'Springfield', 'IL', '62702', '2019-06-10', true, 2),
('Olivia', 'Brown', 'olivia.b@email.com', '555-0103', '1992-11-08', 'FEMALE', '789 Pine Road', 'Springfield', 'IL', '62703', '2021-03-20', true, 3),
('Ethan', 'Davis', 'ethan.d@email.com', '555-0104', '1988-04-30', 'MALE', '321 Cedar Lane', 'Springfield', 'IL', '62704', '2018-09-05', true, 4),
('Sophia', 'Miller', 'sophia.m@email.com', '555-0105', '1995-01-17', 'FEMALE', '654 Birch Drive', 'Springfield', 'IL', '62705', '2022-01-12', true, 5),
('Alexander', 'Wilson', 'alexander.w@email.com', '555-0106', '1982-09-25', 'MALE', '987 Elm Street', 'Springfield', 'IL', '62706', '2017-04-18', true, 1),
('Isabella', 'Moore', 'isabella.m@email.com', '555-0107', '1990-06-12', 'FEMALE', '147 Walnut Avenue', 'Springfield', 'IL', '62707', '2020-08-22', true, 2),
('William', 'Taylor', 'william.t@email.com', '555-0108', '1975-12-03', 'MALE', '258 Spruce Road', 'Springfield', 'IL', '62708', '2016-11-30', true, 3),
('Mia', 'Anderson', 'mia.a@email.com', '555-0109', '1987-08-19', 'FEMALE', '369 Ash Court', 'Springfield', 'IL', '62709', '2019-02-14', true, 4),
('James', 'Thomas', 'james.t@email.com', '555-0110', '1993-05-27', 'MALE', '741 Hickory Lane', 'Springfield', 'IL', '62710', '2021-07-08', true, 5),
('Charlotte', 'Jackson', 'charlotte.j@email.com', '555-0111', '1980-10-14', 'FEMALE', '852 Poplar Street', 'Springfield', 'IL', '62711', '2018-01-25', true, 1),
('Benjamin', 'White', 'benjamin.w@email.com', '555-0112', '1996-02-21', 'MALE', '963 Chestnut Drive', 'Springfield', 'IL', '62712', '2022-05-17', true, 2),
('Amelia', 'Harris', 'amelia.h@email.com', '555-0113', '1984-07-08', 'FEMALE', '159 Sycamore Avenue', 'Springfield', 'IL', '62713', '2017-10-03', true, 3),
('Lucas', 'Martin', 'lucas.m@email.com', '555-0114', '1991-11-30', 'MALE', '357 Magnolia Road', 'Springfield', 'IL', '62714', '2020-04-11', true, 4),
('Harper', 'Garcia', 'harper.g@email.com', '555-0115', '1989-03-05', 'FEMALE', '468 Redwood Court', 'Springfield', 'IL', '62715', '2019-09-19', true, 5),
('Henry', 'Martinez', 'henry.m@email.com', '555-0116', '1977-06-18', 'MALE', '579 Sequoia Lane', 'Springfield', 'IL', '62716', '2016-03-07', true, 1),
('Evelyn', 'Robinson', 'evelyn.r@email.com', '555-0117', '1994-09-22', 'FEMALE', '680 Cypress Street', 'Springfield', 'IL', '62717', '2021-12-01', true, 2),
('Sebastian', 'Clark', 'sebastian.c@email.com', '555-0118', '1983-01-11', 'MALE', '791 Palm Drive', 'Springfield', 'IL', '62718', '2018-06-15', true, 3),
('Abigail', 'Rodriguez', 'abigail.r@email.com', '555-0119', '1997-04-28', 'FEMALE', '802 Juniper Avenue', 'Springfield', 'IL', '62719', '2022-08-27', true, 4),
('Jack', 'Lewis', 'jack.l@email.com', '555-0120', '1986-12-09', 'MALE', '913 Willow Road', 'Springfield', 'IL', '62720', '2017-01-20', true, 5);

-- ============================================================
-- DONATIONS (50 donations over last 6 months)
-- ============================================================
INSERT INTO donations (member_id, amount, category, description, donation_date, payment_method) VALUES
(1, 150.00, 'GENERAL', 'Monthly donation', '2025-12-05', 'CASH'),
(2, 250.00, 'BUILDING', 'Building fund contribution', '2025-12-10', 'CHECK'),
(3, 100.00, 'WELFARE', 'Charity donation', '2025-12-15', 'CREDIT_CARD'),
(4, 300.00, 'GENERAL', 'Year-end donation', '2025-12-20', 'BANK_TRANSFER'),
(5, 75.00, 'YOUTH', 'Youth program support', '2025-12-22', 'CASH'),
(6, 200.00, 'MISSION', 'Mission trip support', '2026-01-05', 'CHECK'),
(7, 125.00, 'GENERAL', 'January donation', '2026-01-10', 'CREDIT_CARD'),
(8, 500.00, 'BUILDING', 'Renovation pledge', '2026-01-15', 'BANK_TRANSFER'),
(9, 85.00, 'WELFARE', 'Community outreach', '2026-01-20', 'CASH'),
(10, 175.00, 'GENERAL', 'Monthly giving', '2026-01-25', 'CHECK'),
(11, 225.00, 'MISSION', 'Missionary support', '2026-02-02', 'CREDIT_CARD'),
(12, 90.00, 'YOUTH', 'Youth camp fund', '2026-02-08', 'CASH'),
(13, 350.00, 'BUILDING', 'Building maintenance', '2026-02-12', 'BANK_TRANSFER'),
(14, 110.00, 'GENERAL', 'February donation', '2026-02-18', 'CHECK'),
(15, 160.00, 'WELFARE', 'Benevolence fund', '2026-02-22', 'CASH'),
(16, 400.00, 'GENERAL', 'Quarterly giving', '2026-02-28', 'BANK_TRANSFER'),
(17, 95.00, 'YOUTH', 'Youth events', '2026-03-05', 'CREDIT_CARD'),
(18, 280.00, 'BUILDING', 'Building expansion', '2026-03-10', 'CHECK'),
(19, 130.00, 'MISSION', 'Missionary family', '2026-03-15', 'CASH'),
(20, 210.00, 'GENERAL', 'March donation', '2026-03-20', 'CREDIT_CARD'),
(1, 180.00, 'WELFARE', 'Emergency relief', '2026-03-25', 'BANK_TRANSFER'),
(3, 220.00, 'GENERAL', 'Spring giving', '2026-03-30', 'CHECK'),
(5, 140.00, 'YOUTH', 'Youth retreat', '2026-04-02', 'CASH'),
(7, 260.00, 'BUILDING', 'Roof repair', '2026-04-08', 'BANK_TRANSFER'),
(9, 115.00, 'MISSION', 'Evangelism support', '2026-04-12', 'CREDIT_CARD'),
(11, 325.00, 'GENERAL', 'April donation', '2026-04-18', 'CHECK'),
(13, 85.00, 'WELFARE', 'Food pantry', '2026-04-22', 'CASH'),
(15, 195.00, 'YOUTH', 'Summer programs', '2026-04-28', 'CREDIT_CARD'),
(17, 375.00, 'BUILDING', 'Parking lot', '2026-05-02', 'BANK_TRANSFER'),
(19, 105.00, 'GENERAL', 'May donation', '2026-05-08', 'CHECK'),
(2, 240.00, 'MISSION', 'Mission conference', '2026-05-12', 'BANK_TRANSFER'),
(4, 155.00, 'WELFARE', 'Member assistance', '2026-05-18', 'CASH'),
(6, 290.00, 'GENERAL', 'Mid-year giving', '2026-05-22', 'CREDIT_CARD'),
(8, 170.00, 'YOUTH', 'Youth conference', '2026-05-28', 'CHECK'),
(10, 340.00, 'BUILDING', 'Furniture update', '2026-06-02', 'BANK_TRANSFER'),
(12, 120.00, 'MISSION', 'Summer missions', '2026-06-08', 'CASH'),
(14, 205.00, 'GENERAL', 'June donation', '2026-06-12', 'CREDIT_CARD'),
(16, 185.00, 'WELFARE', 'Community dinner', '2026-06-18', 'CHECK'),
(18, 450.00, 'BUILDING', 'Sound system', '2026-06-22', 'BANK_TRANSFER'),
(20, 135.00, 'YOUTH', 'Camp scholarship', '2026-06-28', 'CASH'),
(1, 275.00, 'GENERAL', 'Birthday blessing', '2025-12-28', 'CASH'),
(6, 310.00, 'MISSION', 'Year-end missions', '2025-12-30', 'BANK_TRANSFER'),
(11, 145.00, 'WELFARE', 'Holiday outreach', '2025-12-29', 'CHECK'),
(16, 365.00, 'GENERAL', 'Christmas offering', '2025-12-25', 'CREDIT_CARD'),
(3, 95.00, 'YOUTH', 'Youth Christmas', '2025-12-24', 'CASH'),
(8, 425.00, 'BUILDING', 'Year-end building', '2025-12-27', 'BANK_TRANSFER'),
(14, 165.00, 'MISSION', 'Missionary Christmas', '2025-12-23', 'CHECK'),
(19, 230.00, 'WELFARE', 'Holiday benevolence', '2025-12-26', 'CASH'),
(20, 180.00, 'GENERAL', 'New Year seed', '2025-12-31', 'CREDIT_CARD');

-- ============================================================
-- TITHES (30 tithes over last 6 months)
-- ============================================================
INSERT INTO tithes (member_id, amount, tithe_date, payment_method) VALUES
(1, 200.00, '2025-12-01', 'CASH'),
(2, 350.00, '2025-12-01', 'BANK_TRANSFER'),
(4, 500.00, '2025-12-01', 'CHECK'),
(6, 275.00, '2025-12-01', 'CASH'),
(8, 600.00, '2025-12-01', 'BANK_TRANSFER'),
(11, 180.00, '2026-01-05', 'CASH'),
(13, 420.00, '2026-01-05', 'BANK_TRANSFER'),
(16, 380.00, '2026-01-05', 'CHECK'),
(18, 290.00, '2026-01-05', 'CASH'),
(20, 450.00, '2026-01-05', 'BANK_TRANSFER'),
(1, 200.00, '2026-02-02', 'CASH'),
(2, 350.00, '2026-02-02', 'BANK_TRANSFER'),
(4, 500.00, '2026-02-02', 'CHECK'),
(6, 275.00, '2026-02-02', 'CASH'),
(8, 600.00, '2026-02-02', 'BANK_TRANSFER'),
(11, 180.00, '2026-03-02', 'CASH'),
(13, 420.00, '2026-03-02', 'BANK_TRANSFER'),
(16, 380.00, '2026-03-02', 'CHECK'),
(18, 290.00, '2026-03-02', 'CASH'),
(20, 450.00, '2026-03-02', 'BANK_TRANSFER'),
(1, 200.00, '2026-04-06', 'CASH'),
(2, 350.00, '2026-04-06', 'BANK_TRANSFER'),
(4, 500.00, '2026-04-06', 'CHECK'),
(6, 275.00, '2026-04-06', 'CASH'),
(8, 600.00, '2026-04-06', 'BANK_TRANSFER'),
(11, 180.00, '2026-05-04', 'CASH'),
(13, 420.00, '2026-05-04', 'BANK_TRANSFER'),
(16, 380.00, '2026-05-04', 'CHECK'),
(18, 290.00, '2026-05-04', 'CASH'),
(20, 450.00, '2026-05-04', 'BANK_TRANSFER');

-- ============================================================
-- OFFERINGS (20 offerings)
-- ============================================================
INSERT INTO offerings (service_date, service_type, amount, offering_type, description, recorded_by) VALUES
('2025-12-01', 'SUNDAY_MORNING', 1250.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2025-12-08', 'SUNDAY_MORNING', 1180.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2025-12-15', 'SUNDAY_MORNING', 1320.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2025-12-22', 'SUNDAY_MORNING', 1450.00, 'CHRISTMAS', 'Christmas special', 'Sarah Mitchell'),
('2025-12-25', 'CHRISTMAS_SERVICE', 2100.00, 'CHRISTMAS', 'Christmas Day service', 'Sarah Mitchell'),
('2026-01-05', 'SUNDAY_MORNING', 1100.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-01-12', 'SUNDAY_MORNING', 1220.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-01-19', 'SUNDAY_MORNING', 1150.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-02-02', 'SUNDAY_MORNING', 1280.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-02-09', 'SUNDAY_MORNING', 1350.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-02-16', 'SUNDAY_MORNING', 1190.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-03-02', 'SUNDAY_MORNING', 1420.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-03-09', 'SUNDAY_MORNING', 1280.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-03-16', 'SUNDAY_MORNING', 1350.00, 'EASTER', 'Easter Sunday service', 'Sarah Mitchell'),
('2026-04-06', 'SUNDAY_MORNING', 1180.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-04-13', 'SUNDAY_MORNING', 1250.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-05-04', 'SUNDAY_MORNING', 1320.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-05-11', 'SUNDAY_MORNING', 1400.00, 'MOTHERS_DAY', 'Mother''s Day special', 'Sarah Mitchell'),
('2026-06-01', 'SUNDAY_MORNING', 1290.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell'),
('2026-06-08', 'SUNDAY_MORNING', 1380.00, 'GENERAL', 'Sunday morning service', 'Sarah Mitchell');

-- ============================================================
-- EXPENSES (25 expenses)
-- ============================================================
INSERT INTO expenses (category, amount, description, expense_date, payment_method, approved_by) VALUES
('UTILITIES', 450.00, 'Electric bill - December', '2025-12-05', 'BANK_TRANSFER', 'Sarah Mitchell'),
('SALARIES', 3500.00, 'Pastor salary - December', '2025-12-15', 'BANK_TRANSFER', 'James Wilson'),
('MAINTENANCE', 275.00, 'Plumbing repair', '2025-12-20', 'CREDIT_CARD', 'Sarah Mitchell'),
('UTILITIES', 420.00, 'Electric bill - January', '2026-01-05', 'BANK_TRANSFER', 'Sarah Mitchell'),
('SALARIES', 3500.00, 'Pastor salary - January', '2026-01-15', 'BANK_TRANSFER', 'James Wilson'),
('SUPPLIES', 150.00, 'Office supplies', '2026-01-18', 'CASH', 'Sarah Mitchell'),
('UTILITIES', 395.00, 'Electric bill - February', '2026-02-05', 'BANK_TRANSFER', 'Sarah Mitchell'),
('SALARIES', 3500.00, 'Pastor salary - February', '2026-02-15', 'BANK_TRANSFER', 'James Wilson'),
('MAINTENANCE', 850.00, 'HVAC maintenance', '2026-02-20', 'CHECK', 'Sarah Mitchell'),
('UTILITIES', 410.00, 'Electric bill - March', '2026-03-05', 'BANK_TRANSFER', 'Sarah Mitchell'),
('SALARIES', 3500.00, 'Pastor salary - March', '2026-03-15', 'BANK_TRANSFER', 'James Wilson'),
('EVENTS', 325.00, 'Easter event supplies', '2026-03-25', 'CASH', 'Sarah Mitchell'),
('UTILITIES', 430.00, 'Electric bill - April', '2026-04-05', 'BANK_TRANSFER', 'Sarah Mitchell'),
('SALARIES', 3500.00, 'Pastor salary - April', '2026-04-15', 'BANK_TRANSFER', 'James Wilson'),
('MAINTENANCE', 220.00, 'Window cleaning', '2026-04-20', 'CASH', 'Sarah Mitchell'),
('UTILITIES', 405.00, 'Electric bill - May', '2026-05-05', 'BANK_TRANSFER', 'Sarah Mitchell'),
('SALARIES', 3500.00, 'Pastor salary - May', '2026-05-15', 'BANK_TRANSFER', 'James Wilson'),
('EVENTS', 180.00, 'Mother''s Day brunch', '2026-05-11', 'CREDIT_CARD', 'Sarah Mitchell'),
('UTILITIES', 440.00, 'Electric bill - June', '2026-06-05', 'BANK_TRANSFER', 'Sarah Mitchell'),
('SALARIES', 3500.00, 'Pastor salary - June', '2026-06-15', 'BANK_TRANSFER', 'James Wilson'),
('SUPPLIES', 210.00, 'Cleaning supplies', '2026-06-10', 'CASH', 'Sarah Mitchell'),
('MAINTENANCE', 680.00, 'Roof inspection', '2026-06-12', 'CHECK', 'Sarah Mitchell'),
('EVENTS', 290.00, 'VBS supplies', '2026-06-18', 'CREDIT_CARD', 'Sarah Mitchell'),
('UTILITIES', 125.00, 'Internet bill - June', '2026-06-20', 'BANK_TRANSFER', 'Sarah Mitchell'),
('MISCELLANEOUS', 95.00, 'Postage and shipping', '2026-06-22', 'CASH', 'Sarah Mitchell');

-- ============================================================
-- BUDGETS (10 budgets for current year)
-- ============================================================
INSERT INTO budgets (name, category, amount, spent, period, start_date, end_date, notes) VALUES
('Operations Budget', 'UTILITIES', 5000.00, 2550.00, '2026', '2026-01-01', '2026-12-31', 'Annual utilities and operations'),
('Staff Compensation', 'SALARIES', 42000.00, 21000.00, '2026', '2026-01-01', '2026-12-31', 'Pastor and staff salaries'),
('Building Maintenance', 'MAINTENANCE', 5000.00, 2025.00, '2026', '2026-01-01', '2026-12-31', 'Facility repairs and upkeep'),
('Ministry Supplies', 'SUPPLIES', 2000.00, 360.00, '2026', '2026-01-01', '2026-12-31', 'Office and ministry supplies'),
('Events and Programs', 'EVENTS', 3000.00, 795.00, '2026', '2026-01-01', '2026-12-31', 'Church events and programs'),
('Missions', 'MISSIONS', 4000.00, 1200.00, '2026', '2026-01-01', '2026-12-31', 'Missionary support and trips'),
('Youth Programs', 'YOUTH', 2500.00, 850.00, '2026', '2026-01-01', '2026-12-31', 'Youth ministry activities'),
('Building Fund', 'BUILDING', 15000.00, 3500.00, '2026', '2026-01-01', '2026-12-31', 'Building expansion and renovation'),
('Welfare Ministry', 'WELFARE', 3000.00, 600.00, '2026', '2026-01-01', '2026-12-31', 'Community outreach and benevolence'),
('Outreach', 'OUTREACH', 2000.00, 450.00, '2026', '2026-01-01', '2026-12-31', 'Evangelism and outreach');

-- ============================================================
-- FUND TRANSACTIONS (5 transactions)
-- ============================================================
INSERT INTO fund_transactions (fund_id, transaction_type, amount, description, reference_number, source_type, transaction_date, created_by) VALUES
(1, 'INCOME', 1250.00, 'January tithes and offerings', 'TXN-2026-001', 'OFFERING', '2026-01-05', 'admin@gracechurch.org'),
(2, 'INCOME', 500.00, 'Building fund donation', 'TXN-2026-002', 'DONATION', '2026-01-15', 'admin@gracechurch.org'),
(1, 'EXPENSE', 450.00, 'Electric bill payment', 'TXN-2026-003', 'EXPENSE', '2026-01-20', 'admin@gracechurch.org'),
(3, 'INCOME', 200.00, 'Welfare fund contribution', 'TXN-2026-004', 'DONATION', '2026-02-05', 'admin@gracechurch.org'),
(4, 'TRANSFER', 150.00, 'Transfer to Youth Fund', 'TXN-2026-005', 'TRANSFER', '2026-02-10', 'admin@gracechurch.org');

-- ============================================================
-- PLEDGES (3 pledges)
-- ============================================================
INSERT INTO pledges (member_id, pledge_type, description, pledge_amount, amount_paid, due_date, status, frequency) VALUES
(1, 'BUILDING', 'Building expansion pledge', 5000.00, 2500.00, '2026-12-31', 'ACTIVE', 'MONTHLY'),
(2, 'MISSION', 'Mission trip sponsorship', 3000.00, 1800.00, '2026-08-31', 'ACTIVE', 'MONTHLY'),
(4, 'GENERAL', 'Annual giving pledge', 12000.00, 6000.00, '2026-12-31', 'ACTIVE', 'QUARTERLY');

-- ============================================================
-- FINANCIAL GOALS (2 goals)
-- ============================================================
INSERT INTO financial_goals (name, description, target_amount, amount_raised, start_date, end_date, status, category) VALUES
('Building Renovation', 'Raise funds for church building renovation and expansion', 50000.00, 18500.00, '2025-01-01', '2026-12-31', 'ACTIVE', 'BUILDING'),
('Youth Camp 2026', 'Fund summer youth camp and retreat programs', 8000.00, 3200.00, '2026-01-01', '2026-07-31', 'ACTIVE', 'YOUTH');

-- ============================================================
-- GOAL CONTRIBUTIONS
-- ============================================================
INSERT INTO goal_contributions (goal_id, member_id, amount, contribution_date, payment_method, notes) VALUES
(1, 1, 500.00, '2025-06-15', 'CHECK', 'First installment'),
(1, 2, 750.00, '2025-07-20', 'BANK_TRANSFER', 'Building pledge'),
(1, 4, 1000.00, '2025-08-15', 'CHECK', 'Quarterly pledge'),
(1, 6, 400.00, '2025-09-10', 'CASH', 'Personal contribution'),
(1, 8, 1200.00, '2025-10-05', 'BANK_TRANSFER', 'Generous gift'),
(1, 11, 300.00, '2025-11-15', 'CASH', 'Year-end giving'),
(1, 13, 650.00, '2025-12-20', 'CHECK', 'Christmas gift'),
(1, 16, 800.00, '2026-01-10', 'BANK_TRANSFER', 'New Year seed'),
(1, 18, 450.00, '2026-02-15', 'CASH', 'Building blessing'),
(1, 20, 375.00, '2026-03-20', 'CREDIT_CARD', 'Spring contribution'),
(1, 2, 500.00, '2026-04-10', 'BANK_TRANSFER', 'Additional pledge'),
(1, 4, 600.00, '2026-05-15', 'CHECK', 'Mid-year gift'),
(1, 8, 375.00, '2026-06-01', 'CASH', 'Summer gift'),
(2, 3, 800.00, '2026-01-15', 'CASH', 'Youth camp fund'),
(2, 5, 500.00, '2026-02-20', 'CREDIT_CARD', 'Youth support'),
(2, 7, 600.00, '2026-03-10', 'CHECK', 'Camp scholarship'),
(2, 10, 400.00, '2026-04-05', 'CASH', 'Youth blessing'),
(2, 12, 350.00, '2026-05-15', 'CREDIT_CARD', 'Summer program'),
(2, 15, 300.00, '2026-06-01', 'CASH', 'Camp preparation'),
(2, 17, 250.00, '2026-06-10', 'CHECK', 'Final contribution');

-- ============================================================
-- RECEIPTS (10 receipts)
-- ============================================================
INSERT INTO receipts (receipt_number, member_id, contribution_type, contribution_id, amount, receipt_date, treasurer_name, status) VALUES
('REC-2026-0001', 1, 'TITHE', 1, 200.00, '2025-12-01', 'Sarah Mitchell', 'ISSUED'),
('REC-2026-0002', 2, 'TITHE', 2, 350.00, '2025-12-01', 'Sarah Mitchell', 'ISSUED'),
('REC-2026-0003', 4, 'TITHE', 3, 500.00, '2025-12-01', 'Sarah Mitchell', 'SENT'),
('REC-2026-0004', 1, 'DONATION', 1, 150.00, '2025-12-05', 'Sarah Mitchell', 'ISSUED'),
('REC-2026-0005', 3, 'DONATION', 3, 100.00, '2025-12-15', 'Sarah Mitchell', 'PRINTED'),
('REC-2026-0006', 6, 'TITHE', 5, 275.00, '2025-12-01', 'Sarah Mitchell', 'SENT'),
('REC-2026-0007', 8, 'TITHE', 6, 600.00, '2025-12-01', 'Sarah Mitchell', 'ISSUED'),
('REC-2026-0008', 1, 'TITHE', 11, 200.00, '2026-01-05', 'Sarah Mitchell', 'ISSUED'),
('REC-2026-0009', 2, 'DONATION', 6, 200.00, '2026-01-05', 'Sarah Mitchell', 'PRINTED'),
('REC-2026-0010', 11, 'TITHE', 11, 180.00, '2026-01-05', 'Sarah Mitchell', 'ISSUED');

-- ============================================================
-- CASH FLOW ENTRIES (15 entries)
-- ============================================================
INSERT INTO cash_flow_entries (entry_date, entry_type, category, description, amount, reference_number, source, created_by) VALUES
('2025-12-01', 'INCOME', 'Tithes', 'Weekly tithes collection', 1325.00, 'CF-2025-001', 'TITHE', 'admin@gracechurch.org'),
('2025-12-05', 'EXPENSE', 'Utilities', 'Electric bill payment', 450.00, 'CF-2025-002', 'EXPENSE', 'admin@gracechurch.org'),
('2025-12-15', 'INCOME', 'Donations', 'Monthly donations', 875.00, 'CF-2025-003', 'DONATION', 'admin@gracechurch.org'),
('2026-01-05', 'INCOME', 'Offerings', 'Sunday service offerings', 1100.00, 'CF-2026-001', 'OFFERING', 'admin@gracechurch.org'),
('2026-01-10', 'EXPENSE', 'Salaries', 'Pastor salary payment', 3500.00, 'CF-2026-002', 'EXPENSE', 'admin@gracechurch.org'),
('2026-01-20', 'INCOME', 'Tithes', 'Monthly tithes', 1430.00, 'CF-2026-003', 'TITHE', 'admin@gracechurch.org'),
('2026-02-02', 'EXPENSE', 'Utilities', 'Electric bill payment', 420.00, 'CF-2026-004', 'EXPENSE', 'admin@gracechurch.org'),
('2026-02-10', 'INCOME', 'Donations', 'Donation receipts', 720.00, 'CF-2026-005', 'DONATION', 'admin@gracechurch.org'),
('2026-02-15', 'INCOME', 'Offerings', 'Sunday service offerings', 1280.00, 'CF-2026-006', 'OFFERING', 'admin@gracechurch.org'),
('2026-03-02', 'EXPENSE', 'Maintenance', 'HVAC maintenance', 850.00, 'CF-2026-007', 'EXPENSE', 'admin@gracechurch.org'),
('2026-03-05', 'INCOME', 'Tithes', 'Monthly tithes', 1520.00, 'CF-2026-008', 'TITHE', 'admin@gracechurch.org'),
('2026-03-15', 'INCOME', 'Donations', 'Building fund donations', 950.00, 'CF-2026-009', 'DONATION', 'admin@gracechurch.org'),
('2026-04-05', 'EXPENSE', 'Utilities', 'Electric bill payment', 430.00, 'CF-2026-010', 'EXPENSE', 'admin@gracechurch.org'),
('2026-04-10', 'INCOME', 'Offerings', 'Easter service offerings', 1420.00, 'CF-2026-011', 'OFFERING', 'admin@gracechurch.org'),
('2026-05-05', 'INCOME', 'Tithes', 'Monthly tithes', 1400.00, 'CF-2026-012', 'TITHE', 'admin@gracechurch.org');

-- ============================================================
-- AUDIT LOGS (sample entries)
-- ============================================================
INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) VALUES
(1, 'CREATE', 'MEMBER', 1, '192.168.1.100'),
(1, 'CREATE', 'MEMBER', 2, '192.168.1.100'),
(1, 'UPDATE', 'MEMBER', 1, '192.168.1.100'),
(3, 'CREATE', 'DONATION', 1, '192.168.1.101'),
(3, 'CREATE', 'TITHE', 1, '192.168.1.101'),
(3, 'CREATE', 'EXPENSE', 1, '192.168.1.101'),
(2, 'READ', 'REPORT', NULL, '192.168.1.102'),
(1, 'UPDATE', 'BUDGET', 1, '192.168.1.100'),
(3, 'CREATE', 'OFFERING', 1, '192.168.1.101'),
(4, 'CREATE', 'ANNOUNCEMENT', 1, '192.168.1.103');

-- ============================================================
-- NOTIFICATIONS (sample entries)
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, read) VALUES
(1, 'New Member Registration', 'A new member has registered: Grace Johnson', 'MEMBER', false),
(3, 'Expense Approval Required', 'An expense of $850.00 needs your approval', 'EXPENSE', false),
(1, 'Budget Alert', 'Building Fund budget is at 70% utilization', 'BUDGET', true),
(2, 'Prayer Request', 'A new prayer request has been submitted', 'PRAYER', true),
(3, 'Donation Received', 'Building fund donation of $500 received', 'DONATION', false);
