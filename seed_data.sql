-- Seed Data for Yaba Online Services

-- 1. Service Categories
INSERT INTO public.service_categories (id, name, slug, description, icon, sort_order, is_active)
VALUES
  ('c0a80121-7ac0-4b1a-9f1a-000000000001', 'Government Documents', 'government-documents', 'Official state and national documentation services.', 'FileText', 1, true),
  ('c0a80121-7ac0-4b1a-9f1a-000000000002', 'Financial Services', 'financial-services', 'Banking, tax, and insurance related services.', 'IndianRupee', 2, true),
  ('c0a80121-7ac0-4b1a-9f1a-000000000003', 'Health & Welfare', 'health-welfare', 'Medical cards, insurance, and welfare schemes.', 'Heart', 3, true),
  ('c0a80121-7ac0-4b1a-9f1a-000000000004', 'Travel & Transport', 'travel-transport', 'Passports, driving licenses, and transport permits.', 'Plane', 4, true);

-- 2. Services
INSERT INTO public.services (id, category_id, title, slug, short_description, description, price, processing_time, is_active, is_featured, sort_order)
VALUES
  -- Government Documents (Category 1)
  ('d0a80121-7ac0-4b1a-9f1a-000000000001', 'c0a80121-7ac0-4b1a-9f1a-000000000001', 'Aadhar Card Update', 'aadhar-card-update', 'Update your address, mobile number, or other details in your Aadhar card.', 'Full assistance for biometric and demographic updates in your Unique Identification Authority of India (UIDAI) Aadhar card. We simplify the appointment and document verification process.', 15.00, '3-7 Days', true, true, 1),
  ('d0a80121-7ac0-4b1a-9f1a-000000000002', 'c0a80121-7ac0-4b1a-9f1a-000000000001', 'PAN Card New/Correction', 'pan-card-services', 'Apply for a new PAN card or correct existing details.', 'Get your Permanent Account Number (PAN) card hassle-free. Whether you need a new card for financial transactions or need to correct your name/DOB, we handle the form filling and submission.', 20.00, '15-20 Days', true, true, 2),
  ('d0a80121-7ac0-4b1a-9f1a-000000000003', 'c0a80121-7ac0-4b1a-9f1a-000000000001', 'Voter ID Application', 'voter-id-application', 'Register as a new voter or shift your constituency.', 'Exercise your right to vote. We assist in Form 6 (New Voter), Form 8 (Correction), and constituency shifting applications with the Election Commission.', 10.00, '30 Days', true, false, 3),

  -- Financial Services (Category 2)
  ('d0a80121-7ac0-4b1a-9f1a-000000000004', 'c0a80121-7ac0-4b1a-9f1a-000000000002', 'Income Tax Filing', 'income-tax-filing', 'Professional assistance for filing your annual ITR.', 'Expert assisted ITR filing for salaried individuals, professionals, and small business owners. Ensure compliance and maximize your refunds.', 50.00, '2-3 Days', true, true, 1),
  ('d0a80121-7ac0-4b1a-9f1a-000000000005', 'c0a80121-7ac0-4b1a-9f1a-000000000002', 'MSME Registration', 'msme-registration', 'Register your small business under Udyam Registration.', 'Get your business recognized by the government. MSME registration unlocks benefits like easier bank loans, tax exemptions, and protection against delayed payments.', 35.00, '2-5 Days', true, false, 2),

  -- Travel & Transport (Category 4)
  ('d0a80121-7ac0-4b1a-9f1a-000000000006', 'c0a80121-7ac0-4b1a-9f1a-000000000004', 'Passport Application', 'passport-application-assistance', 'Assistance for new passports and renewals.', 'Complete guidance for your online passport application, socket booking, and document checklist preparation. Valid for Fresh and Re-issue cases.', 40.00, 'Varies', true, true, 1),
  ('d0a80121-7ac0-4b1a-9f1a-000000000007', 'c0a80121-7ac0-4b1a-9f1a-000000000004', 'Driving License Slot', 'driving-license-slot', 'Book your learner or permanent license test slot.', 'Avoid the hassle of finding slots. We help you schedule your driving license test at your nearest RTO.', 12.00, 'Instant', true, false, 2);

-- 3. Service Details (Requirements & FAQs)
INSERT INTO public.service_details (service_id, requirements, process_steps, faqs)
VALUES
  ('d0a80121-7ac0-4b1a-9f1a-000000000001', 
   '["Recent Photograph", "Existing Aadhar Card", "Proof of Address (Utility Bill/Rent Agreement)", "Proof of Identity"]', 
   '["Submit Application", "Book Appointment", "Visit Center for Biometrics", "Download E-Aadhar"]',
   '[{"question": "How long does it take?", "answer": "Usually 7-10 days after the center visit."}, {"question": "Can I update mobile number online?", "answer": "No, mobile number update requires a physical visit to the center."}]'
  ),
  ('d0a80121-7ac0-4b1a-9f1a-000000000006', 
   '["Proof of Address (Aadhar/Utilities)", "Proof of DOB (Birth Certificate/Marksheet)", "Passport Size Photos"]', 
   '["Fill Online Form", "Pay Fees", "Schedule Appointment", "Police Verification", "Passport Dispatch"]',
   '[{"question": "Is police verification mandatory?", "answer": "Yes, for most fresh passports police verification is required."}, {"question": "What is Tatkaal scheme?", "answer": "Tatkaal allows for faster processing (1-3 days) for an additional fee."}]'
  );

-- 4. Hero Services (Cinematic Hero)
INSERT INTO public.hero_services (service_id, title, description, image_folder_url, sort_order, active, cta_text, cta_link)
VALUES
  ('d0a80121-7ac0-4b1a-9f1a-000000000006', 'Global Access', 'Travel the world with our expedited passport services. Fast, reliable, and secure documentation handling.', 'https://raw.githubusercontent.com/yaba-services/assets/main/hero/passport', 1, true, 'Apply for Passport', '/services/passport-application-assistance'),
  ('d0a80121-7ac0-4b1a-9f1a-000000000001', 'Digital Identity', 'Secure your future with updated Aadhar details. We ensure your identity documents are always current.', 'https://raw.githubusercontent.com/yaba-services/assets/main/hero/aadhar', 2, true, 'Update Aadhar', '/services/aadhar-card-update'),
  (NULL, 'Start Your Business', 'Launch your dream enterprise with instant MSME & GST registration support. Be your own boss today.', 'https://raw.githubusercontent.com/yaba-services/assets/main/hero/business', 3, true, 'Register Business', '/services/msme-registration');

-- 5. Notices
INSERT INTO public.notices (title, content, priority, is_active, type)
VALUES
  ('Office Closed on Friday', 'Our offices will remain closed this Friday due to National Holiday. Online services will continue uninterrupted.', 'normal', true, 'info'),
  ('Passport Fee Hike', 'The government has announced a 10% hike in passport application fees effective next month. Apply now to save.', 'high', true, 'alert'),
  ('System Maintenance', 'Scheduled maintenance on Sunday 2 AM - 4 AM. Booking services might be unavailable.', 'low', true, 'warning');

-- 6. Testimonials
INSERT INTO public.testimonials (author_name, role_title, content, rating, is_featured)
VALUES
  ('Rahul Sharma', 'Business Owner', 'Excellent service! Got my MSME registration done in just 2 days properly. Highly recommended.', 5, true),
  ('Priya Patel', 'Student', 'Very helpful staff. They guided me through the entire passport application process.', 5, true),
  ('Amit Verma', 'Freelancer', 'Income tax filing was super smooth. The portal is easy to use and the team is responsive.', 4, true);

-- 7. Site Settings
INSERT INTO public.site_settings (key, value, label, group_name)
VALUES
  ('contact_email', '"support@yabaservices.com"', 'Support Email', 'general'),
  ('contact_phone', '"+91 98765 43210"', 'Support Phone', 'general'),
  ('office_address', '"123, Digital Plaza, Tech City, India"', 'Office Address', 'general'),
  ('working_hours', '"Mon - Sat: 9:00 AM - 7:00 PM"', 'Working Hours', 'general');

