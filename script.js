// Hero email submission handler (globally accessible)
window.handleHeroEmailSubmit = function(event) {
    console.log('Hero email submit handler called');
    event.preventDefault();
    event.stopPropagation();
    
    const form = document.getElementById('emailForm');
    if (form) {
        const emailInput = form.querySelector('input[type="email"]');
        const email = emailInput ? emailInput.value.trim() : '';
        console.log('Hero email submit with email:', email);
        
        if (email && email.includes('@')) {
            console.log('Valid email, storing and opening modal');
            localStorage.setItem('userEmail', email);
            window.openOnboardingModal();
            
            setTimeout(() => {
                const modalEmailInput = document.querySelector('#step1 input[type="email"]');
                if (modalEmailInput) {
                    modalEmailInput.value = email;
                    console.log('Pre-filled email in modal');
                }
            }, 200);
        } else {
            alert('Please enter a valid email address');
        }
    } else {
        console.error('Email form not found');
    }
};

// Modal Management
let currentStep = 1;
const totalSteps = 4;

// Open onboarding modal - Make sure this is globally accessible
window.openOnboardingModal = function() {
    console.log('Opening onboarding modal'); // Debug log
    const modal = document.getElementById('onboardingModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentStep = 1;
        updateProgressBar();
        showStep(1);
        console.log('Modal opened successfully');
    } else {
        console.error('Modal element not found');
    }
}

// Close onboarding modal
window.closeOnboardingModal = function() {
    const modal = document.getElementById('onboardingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        currentStep = 1;
        resetModal();
    }
}

// Close thank you modal
window.closeThankYouModal = function() {
    const modal = document.getElementById('thankYouModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Navigate to next step
window.nextStep = function(step) {
    if (step <= totalSteps) {
        currentStep = step;
        showStep(step);
        updateProgressBar();
    }
}

// Show specific step
function showStep(step) {
    // Hide all steps
    const steps = document.querySelectorAll('.modal-step');
    steps.forEach(s => s.classList.remove('active'));
    
    // Show current step
    const currentStepElement = document.getElementById(`step${step}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }
}

// Update progress bar
function updateProgressBar() {
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

// Reset modal to initial state
function resetModal() {
    const steps = document.querySelectorAll('.modal-step');
    steps.forEach(s => s.classList.remove('active'));
    
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach(s => s.classList.remove('active'));
    
    // Reset forms
    const forms = document.querySelectorAll('.step-form');
    forms.forEach(form => form.reset());
    
    // Show first step
    showStep(1);
    updateProgressBar();
}

// Complete signup process
window.completeSignup = function() {
    closeOnboardingModal();
    
    // Show thank you modal
    setTimeout(() => {
        const thankYouModal = document.getElementById('thankYouModal');
        if (thankYouModal) {
            thankYouModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }, 300);
}

// Email form submission
function handleEmailSubmission() {
    const emailForm = document.getElementById('emailForm');
    console.log('Setting up email form handler, form found:', emailForm);
    
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Email form submitted');
            
            const emailInput = emailForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            
            console.log('Form submitted with email:', email);
            
            if (email && email.includes('@')) {
                // Store email for use in modal
                localStorage.setItem('userEmail', email);
                
                // Open onboarding modal
                window.openOnboardingModal();
                
                // Pre-fill email in modal
                setTimeout(() => {
                    const modalEmailInput = document.querySelector('#step1 input[type="email"]');
                    if (modalEmailInput) {
                        modalEmailInput.value = email;
                        console.log('Pre-filled email in modal:', email);
                    }
                }, 200);
            } else {
                alert('Please enter a valid email address');
            }
        });
        console.log('Email form event listener added');
    } else {
        console.error('Email form not found');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    console.log('Window functions available:', {
        openOnboardingModal: typeof window.openOnboardingModal,
        closeOnboardingModal: typeof window.closeOnboardingModal,
        nextStep: typeof window.nextStep
    });
    
    // Handle logo image loading
    const logoImage = document.querySelector('.logo-image');
    const logoFallback = document.querySelector('.logo-fallback');
    
    if (logoImage && logoFallback) {
        logoImage.addEventListener('error', function() {
            console.log('Logo image failed to load, showing fallback');
            this.style.display = 'none';
            logoFallback.style.display = 'flex';
        });
        
        logoImage.addEventListener('load', function() {
            console.log('Logo image loaded successfully');
            logoFallback.style.display = 'none';
        });
        
        // Check if image is already loaded or failed
        if (logoImage.complete) {
            if (logoImage.naturalWidth === 0) {
                logoImage.style.display = 'none';
                logoFallback.style.display = 'flex';
            }
        }
    }
    
    // Initialize email form handling
    handleEmailSubmission();
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
                if (modal.id === 'onboardingModal') {
                    resetModal();
                }
            }
        });
    });
    
    // Handle payout method selection
    const payoutCards = document.querySelectorAll('.payout-card');
    payoutCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove selection from all cards
            payoutCards.forEach(c => c.style.borderColor = '#e2e8f0');
            
            // Select clicked card
            this.style.borderColor = '#667eea';
            
            // Check the radio button
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });
    
    // Handle connection card interactions
    const connectionCards = document.querySelectorAll('.connection-card');
    connectionCards.forEach(card => {
        const connectBtn = card.querySelector('.btn-outline');
        if (connectBtn) {
            connectBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Simulate connection process
                const originalText = this.textContent;
                this.textContent = 'Connecting...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.textContent = 'Connected ✓';
                    this.style.background = '#38a169';
                    this.style.color = 'white';
                    this.style.borderColor = '#38a169';
                }, 2000);
            });
        }
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Enhanced Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');

    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            nav.classList.toggle('active');
            
            // Update toggle icon
            const icon = this.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.className = 'fas fa-times';
                this.setAttribute('aria-expanded', 'true');
            } else {
                icon.className = 'fas fa-bars';
                this.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!header.contains(e.target) && nav.classList.contains('active')) {
                nav.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu when clicking on nav links
        nav.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                nav.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                nav.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.className = 'fas fa-bars';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Enhanced responsive behavior
    function handleResize() {
        const windowWidth = window.innerWidth;
        
        // Close mobile menu on resize to desktop
        if (windowWidth > 768 && nav && nav.classList.contains('active')) {
            nav.classList.remove('active');
            const icon = mobileMenuToggle?.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }
        
        // Adjust modal size on very small screens
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (windowWidth <= 480) {
                modal.style.width = '95%';
                modal.style.margin = '0.5rem';
            } else if (windowWidth <= 768) {
                modal.style.width = '90%';
                modal.style.margin = '1rem';
            } else {
                modal.style.width = '';
                modal.style.margin = '';
            }
        });
    }

    // Debounced resize handler
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });

    // Initial call
    handleResize();

    // Touch-friendly enhancements
    function addTouchEnhancements() {
        // Add touch feedback to buttons
        const buttons = document.querySelectorAll('.btn, .carousel-btn, .faq-question');
        
        buttons.forEach(button => {
            button.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            button.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.style.transform = '';
                }, 100);
            });
        });
        
        // Smooth scrolling for anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = header?.offsetHeight || 0;
                    const trustBarHeight = document.querySelector('.trust-bar')?.offsetHeight || 0;
                    const offset = headerHeight + trustBarHeight + 20;
                    
                    window.scrollTo({
                        top: target.offsetTop - offset,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Initialize touch enhancements when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addTouchEnhancements);
    } else {
        addTouchEnhancements();
    }
    
    // Add loading states to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('btn-outline')) {
                const originalText = this.textContent;
                this.textContent = 'Loading...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 1000);
            }
        });
    });
    
    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#e53e3e';
                } else {
                    field.style.borderColor = '#e2e8f0';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });
    
    // Add animation on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.step-card, .testimonial-card, .hero-text, .hero-visual');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Pre-fill email from localStorage if available
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (!input.value) {
                input.value = storedEmail;
            }
        });
    }
    
    // FAQ functionality
    console.log('Initializing FAQ functionality...');
    const faqCategories = document.querySelectorAll('.faq-category');
    const faqSections = document.querySelectorAll('.faq-section');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqSearch = document.getElementById('faqSearch');
    
    console.log('Found FAQ elements:', {
        categories: faqCategories.length,
        sections: faqSections.length,
        items: faqItems.length
    });
    
    // FAQ category switching
    faqCategories.forEach(category => {
        category.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            console.log('FAQ category clicked:', targetCategory);
            
            // Update active category button
            faqCategories.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            faqSections.forEach(section => {
                section.classList.remove('active');
                if (section.getAttribute('data-category') === targetCategory) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // FAQ item toggle
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                console.log('FAQ item clicked');
                const isActive = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                    console.log('FAQ item opened');
                } else {
                    console.log('FAQ item closed');
                }
            });
        }
    });
    
    // FAQ search functionality
    if (faqSearch) {
        faqSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const allFaqItems = document.querySelectorAll('.faq-item');
            
            allFaqItems.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show all sections when searching
            if (searchTerm) {
                faqSections.forEach(section => {
                    section.classList.add('active');
                });
                faqCategories.forEach(cat => cat.classList.remove('active'));
            } else {
                // Reset to default state
                faqSections.forEach(section => {
                    section.classList.remove('active');
                });
                faqCategories[0].classList.add('active');
                faqSections[0].classList.add('active');
                allFaqItems.forEach(item => {
                    item.style.display = 'block';
                });
                         }
         });
     }
    
    // Initialize carousel
    initializeCarousel();
    
    // Test button functionality
    const testButtons = document.querySelectorAll('button[onclick*="openOnboardingModal"]');
    console.log('Found', testButtons.length, 'modal trigger buttons');
    
    // Add click event listeners as backup
    testButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Button clicked, opening modal...');
            window.openOnboardingModal();
        });
    });
    
    // Special handling for email form button - try multiple selectors
    let emailFormButton = document.querySelector('#emailForm button[type="submit"]');
    if (!emailFormButton) {
        emailFormButton = document.querySelector('.email-form button');
    }
    if (!emailFormButton) {
        emailFormButton = document.querySelector('form button[type="submit"]');
    }
    
    console.log('Email form button found:', emailFormButton);
    console.log('Email form found:', document.querySelector('#emailForm'));
    
    if (emailFormButton) {
        // Remove any existing event listeners by cloning the button
        const newButton = emailFormButton.cloneNode(true);
        emailFormButton.parentNode.replaceChild(newButton, emailFormButton);
        emailFormButton = newButton;
        
        emailFormButton.addEventListener('click', function(e) {
            console.log('Email form button clicked - preventing default');
            e.preventDefault(); // Always prevent form submission
            e.stopPropagation();
            
            const form = this.closest('form') || document.querySelector('#emailForm');
            if (form) {
                const emailInput = form.querySelector('input[type="email"]');
                const email = emailInput ? emailInput.value.trim() : '';
                console.log('Email from form:', email);
                
                if (email && email.includes('@')) {
                    console.log('Valid email, storing and opening modal');
                    localStorage.setItem('userEmail', email);
                    
                    // Check if modal function exists
                    if (typeof window.openOnboardingModal === 'function') {
                        console.log('Opening modal function exists, calling it');
                        window.openOnboardingModal();
                    } else {
                        console.error('openOnboardingModal function not found');
                    }
                    
                    setTimeout(() => {
                        const modalEmailInput = document.querySelector('#step1 input[type="email"]');
                        if (modalEmailInput) {
                            modalEmailInput.value = email;
                            console.log('Pre-filled email in modal');
                        }
                    }, 200);
                } else {
                    console.log('Invalid email or empty:', email);
                    alert('Please enter a valid email address');
                }
            } else {
                console.error('Form not found');
            }
        });
        console.log('Email form button event listener added');
    } else {
        console.error('Email form button not found with any selector');
        
        // Try to find it with a timeout
        setTimeout(() => {
            const delayedButton = document.querySelector('#emailForm button[type="submit"]');
            console.log('Delayed search for button:', delayedButton);
        }, 1000);
    }
});

// Simple Carousel functionality
let currentSlide = 0;
const totalSlides = 6; // We know we have 6 stories

function initializeCarousel() {
    console.log('Initializing simple carousel...');
    
    const track = document.getElementById('storiesTrack');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!track || !dotsContainer) {
        console.log('Carousel elements not found, retrying...');
        setTimeout(initializeCarousel, 500);
        return;
    }
    
    // Create navigation dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
    
    // Set initial position
    track.style.transform = 'translateX(0%)';
    currentSlide = 0;
    
    // Start auto-play
    setInterval(() => {
        moveCarousel(1);
    }, 4000);
    
    console.log('Carousel initialized successfully');
}

// Global function for button clicks
window.moveCarousel = function(direction) {
    console.log('Moving carousel, direction:', direction);
    
    const track = document.getElementById('storiesTrack');
    if (!track) {
        console.log('Track not found');
        return;
    }
    
    // Update slide index
    currentSlide += direction;
    
    // Handle looping
    if (currentSlide >= totalSlides) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    }
    
    // Calculate position - each slide is 16.67% wide, so move by that amount
    const slideWidth = 100 / 6; // 16.67%
    const translateX = -(currentSlide * slideWidth);
    track.style.transform = `translateX(${translateX}%)`;
    
    console.log('Moved to slide', currentSlide, 'translateX:', translateX + '%');
    
    // Update dots
    updateDots();
}

function goToSlide(index) {
    console.log('Going to slide', index);
    
    const track = document.getElementById('storiesTrack');
    if (!track) return;
    
    currentSlide = index;
    const slideWidth = 100 / 6; // 16.67%
    const translateX = -(currentSlide * slideWidth);
    track.style.transform = `translateX(${translateX}%)`;
    
    updateDots();
}

function updateDots() {
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.step-card, .testimonial-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add typing effect to hero headline
    const heroHeadline = document.querySelector('.hero-text h1');
    if (heroHeadline) {
        const text = heroHeadline.textContent;
        heroHeadline.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroHeadline.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
    
    // Remove problematic counter animation that's causing display issues
    // The static text should display correctly without animation
});

// Add keyboard navigation for modal
document.addEventListener('keydown', function(e) {
    const onboardingModal = document.getElementById('onboardingModal');
    const thankYouModal = document.getElementById('thankYouModal');
    
    if (e.key === 'Escape') {
        if (onboardingModal && onboardingModal.classList.contains('active')) {
            closeOnboardingModal();
        }
        if (thankYouModal && thankYouModal.classList.contains('active')) {
            closeThankYouModal();
        }
    }
    
    if (e.key === 'Enter' && onboardingModal && onboardingModal.classList.contains('active')) {
        const activeStep = document.querySelector('.modal-step.active');
        const nextButton = activeStep.querySelector('.btn-primary');
        if (nextButton && currentStep < totalSteps) {
            nextStep(currentStep + 1);
        }
    }
});

// Add analytics tracking (placeholder for real analytics)
function trackEvent(eventName, properties = {}) {
    console.log('Analytics Event:', eventName, properties);
    // In a real implementation, this would send data to Google Analytics, Mixpanel, etc.
}

// Track important user interactions
document.addEventListener('DOMContentLoaded', function() {
    // Track email submissions
    const emailForm = document.getElementById('emailForm');
    if (emailForm) {
        emailForm.addEventListener('submit', function() {
            trackEvent('email_submitted', {
                source: 'hero_section'
            });
        });
    }
    
    // Track modal opens
    const ctaButtons = document.querySelectorAll('.btn-primary');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function() {
            trackEvent('cta_clicked', {
                button_text: this.textContent,
                location: this.closest('section')?.className || 'unknown'
            });
        });
    });
    
    // Track step completions
    const stepButtons = document.querySelectorAll('[onclick^="nextStep"]');
    stepButtons.forEach(button => {
        button.addEventListener('click', function() {
            const stepMatch = this.getAttribute('onclick').match(/nextStep\((\d+)\)/);
            if (stepMatch) {
                trackEvent('step_completed', {
                    step: stepMatch[1]
                });
            }
        });
    });
    
    // Track signup completion
    const completeButton = document.querySelector('[onclick="completeSignup()"]');
    if (completeButton) {
        completeButton.addEventListener('click', function() {
            trackEvent('signup_completed');
        });
    }
}); 

// Backup FAQ initialization
function initializeFAQ() {
    console.log('Backup FAQ initialization...');
    
    // FAQ item toggle
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            // Remove any existing event listeners by cloning
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);
            
            newQuestion.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('FAQ item clicked (backup)');
                
                const faqItem = this.closest('.faq-item');
                const isActive = faqItem.classList.contains('active');
                
                // Close all FAQ items
                document.querySelectorAll('.faq-item').forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    faqItem.classList.add('active');
                    console.log('FAQ item opened (backup)');
                }
            });
        }
    });
    
    // FAQ category switching
    document.querySelectorAll('.faq-category').forEach(category => {
        category.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            console.log('FAQ category clicked (backup):', targetCategory);
            
            // Update active category
            document.querySelectorAll('.faq-category').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            document.querySelectorAll('.faq-section').forEach(section => {
                section.classList.remove('active');
                if (section.getAttribute('data-category') === targetCategory) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Initialize FAQ when DOM is ready (backup)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFAQ);
} else {
    initializeFAQ();
}

// Also try initializing after a short delay
setTimeout(initializeFAQ, 1000);