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

function openUserFunnelModal() {
    const modal = document.getElementById('userFunnelModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        showFunnelStep(1);
    }
}
window.openUserFunnelModal = openUserFunnelModal;

document.addEventListener('DOMContentLoaded', function() {
    // Hero form submit triggers funnel modal
    const heroForm = document.getElementById('emailForm');
    if (heroForm) {
        heroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = heroForm.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            if (email && email.includes('@')) {
                localStorage.setItem('userEmail', email);
                openUserFunnelModal();
            } else {
                alert('Please enter a valid email address');
            }
        });
    }
    // Name capture step
    const nameForm = document.getElementById('nameCaptureForm');
    if (nameForm) {
        nameForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nameInput = document.getElementById('fullName');
            const name = nameInput ? nameInput.value.trim() : '';
            if (name.length > 1) {
                localStorage.setItem('userName', name);
                showFunnelStep(2);
                setTimeout(() => showFunnelStep(3), 3500);
            } else {
                alert('Please enter your full name');
            }
        });
    }
    // Blurred results step: go to Stripe link step
    const toStripeBtn = document.getElementById('toStripeBtn');
    if (toStripeBtn) {
        toStripeBtn.addEventListener('click', function() {
            showFunnelStep(4);
        });
    }
    // Stripe link step: go to confirmation
    const stripeLinkBtn = document.getElementById('stripeLinkBtn');
    if (stripeLinkBtn) {
        stripeLinkBtn.addEventListener('click', function() {
            showFunnelStep(5);
        });
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

// --- New User Funnel Logic ---
function closeUserFunnelModal() {
    const modal = document.getElementById('userFunnelModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetFunnelModal();
    }
}
function showFunnelStep(step) {
    const steps = [1,2,3,4,5];
    steps.forEach(s => {
        const el = document.getElementById(`funnelStep${s}`);
        if (el) el.style.display = 'none';
    });
    const current = document.getElementById(`funnelStep${step}`);
    if (current) current.style.display = 'block';
}
function resetFunnelModal() {
    showFunnelStep(1);
    const nameInput = document.getElementById('fullName');
    if (nameInput) nameInput.value = '';
}
// Make modal globally accessible for close button
window.closeUserFunnelModal = closeUserFunnelModal;

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