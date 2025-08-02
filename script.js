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
            
            // Try to submit email-only signup to backend
            const referralSource = getReferralSource();
            console.log('Referral source:', referralSource);
            
            fetch('/api/signup-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Not Provided', // Default name for hero form
                    email: email,
                    source: 'hero_form',
                    referralSource: referralSource,
                    flowProgress: 'email_entered'
                })
            }).catch(error => {
                console.error('Failed to submit hero form email:', error);
            });
            
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
        
        // Check if user has already completed the funnel
        const hasCompletedFunnel = localStorage.getItem('funnelCompleted');
        
        if (hasCompletedFunnel === 'true') {
            // User has already completed the funnel, show thank you step directly
            console.log('User has completed funnel before, showing thank you step directly');
            showFunnelStep(5);
        } else {
            // First time user, start from step 1
            showFunnelStep(1);
            
            // Auto-populate email using the global variable
            if (window.lastEnteredEmail) {
                const modalEmailInput = document.getElementById('emailAddress');
                if (modalEmailInput) {
                    modalEmailInput.value = window.lastEnteredEmail;
                }
            }
        }
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
                // Store email globally so modal can access it
                window.lastEnteredEmail = email;
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
        const nameInput = document.getElementById('fullName');
        const emailInput = document.getElementById('emailAddress');
        const submitBtn = document.getElementById('submitBtn');
        
        // Function to validate name (no numbers, more than 6 chars, has space)
        function validateName(name) {
            const trimmedName = name.trim();
            const hasNumbers = /\d/.test(trimmedName);
            const hasSpace = trimmedName.includes(' ');
            const isLongEnough = trimmedName.length > 6;
            
            return !hasNumbers && hasSpace && isLongEnough;
        }
        
        // Simple input listeners - NO validation at all during typing
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                // Do nothing - no validation, no button state updates
                // Just let the user type freely
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('input', function() {
                // Do nothing - no validation, no button state updates
                // Just let the user type freely
            });
        }
        
        // Enable submit button always - let form submission handle validation
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
        
        nameForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation(); // Prevent event bubbling
            console.log('=== FRONTEND: Name capture form submitted ===');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            
            console.log('Form data:', { name, email });
            console.log('Validation check:', {
                nameLength: name.length,
                hasSpace: name.includes(' '),
                hasNumbers: /\d/.test(name),
                nameValid: validateName(name),
                emailValid: email && email.includes('@')
            });
            
            if (validateName(name) && email && email.includes('@')) {
                // Store data locally
                localStorage.setItem('userName', name);
                localStorage.setItem('userEmail', email);
                
                // Show loading animation immediately
                console.log('Showing loading animation...');
                showFunnelStep(2);
                startLoadingAnimation(name);
                
                try {
                    // Send data to backend
                    const referralSource = getReferralSource();
                    const requestBody = {
                        name: name,
                        email: email,
                        source: 'modal_funnel',
                        referralSource: referralSource,
                        flowProgress: 'name_captured'
                    };
                    
                    console.log('Sending request to /api/signup-simple');
                    console.log('Request body:', requestBody);
                    
                    const response = await fetch('/api/signup-simple', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody)
                    });
                    
                    console.log('Response status:', response.status);
                    console.log('Response headers:', response.headers);
                    
                    let data;
                    try {
                        data = await response.json();
                        console.log('Response data:', data);
                    } catch (jsonError) {
                        console.error('Failed to parse response as JSON:', jsonError);
                        console.error('Response text:', await response.text());
                        throw new Error('Invalid response format');
                    }
                    
                    if (data.success) {
                        // Store the actual position
                        // window.actualWaitlistPosition = data.position; // Removed - not displaying position
                        console.log('SUCCESS: Added to waitlist');
                        console.log('Full success response:', data);
                    } else {
                        // Log error but continue with the flow
                        console.error('ERROR: Failed to add to waitlist:', data.error);
                        console.error('Full error response:', data);
                        
                        // If email already exists, still continue with the flow
                        if (data.error && data.error.includes('already on the waitlist')) {
                            console.log('User already on waitlist, continuing with flow...');
                        }
                    }
                } catch (error) {
                    // Log error but don't break the user experience
                    console.error('=== NETWORK ERROR ===');
                    console.error('Error type:', error.name);
                    console.error('Error message:', error.message);
                    console.error('Error stack:', error.stack);
                    console.error('Full error object:', error);
                }
                
                console.log('Continuing with funnel flow regardless of API result...');
                // Continue with the flow regardless of API result
                // The loading animation will complete and move to step 3
            } else {
                console.log('Validation failed - showing error message');
                
                // REMOVE the validation message display on the modal
                // Only show the alert popup, not the red text on the form
                
                // Show specific error message ONLY as alert
                if (/\d/.test(name)) {
                    alert('Please enter your name without numbers');
                } else if (!name.includes(' ')) {
                    alert('Please enter both your first and last name');
                } else if (name.length <= 6) {
                    alert('Please enter your full name (minimum 6 characters)');
                } else if (!email || !email.includes('@')) {
                    alert('Please enter a valid email address');
                } else {
                    alert('Please enter your full name (first and last name)');
                }
                
                // Keep modal open by not calling any close functions
                return false;
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
            // Mark funnel as completed
            localStorage.setItem('funnelCompleted', 'true');
            console.log('Funnel marked as completed');
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
    // Parallax effect for hero section - COMMENTED OUT to fix white space issue
    // window.addEventListener('scroll', function() {
    //     const scrolled = window.pageYOffset;
    //     const hero = document.querySelector('.hero');
    //     if (hero) {
    //         const rate = scrolled * -0.5;
    //         hero.style.transform = `translateY(${rate}px)`;
    //     }
    // });
    
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
        // Check if we're currently on step 5 (thank you step)
        const step5 = document.getElementById('funnelStep5');
        if (step5 && step5.style.display !== 'none') {
            // User is closing from step 5, mark funnel as completed
            localStorage.setItem('funnelCompleted', 'true');
            console.log('Funnel marked as completed (closing from step 5)');
        }
        
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
    if (current) {
        current.style.display = 'block';
        
        // Track progress for specific steps
        if (step === 4) {
            // User viewed the upgrade prompt
            updateFlowProgress('viewed_upgrade');
        } else if (step === 5) {
            // User reached the waitlist confirmation
            updateFlowProgress('joined_waitlist');
            
            // Removed position display logic
        }
    }
}
function resetFunnelModal() {
    showFunnelStep(1);
    const nameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('emailAddress');
    if (nameInput) nameInput.value = '';
    if (emailInput) emailInput.value = '';
}
// Make modal globally accessible for close button
window.closeUserFunnelModal = closeUserFunnelModal;

// Utility function to reset funnel completion status (for testing or admin use)
window.resetFunnelCompletion = function() {
    localStorage.removeItem('funnelCompleted');
    console.log('Funnel completion status reset');
};

// --- Animated Loading Sequence Logic ---
function startLoadingAnimation(userName) {
    // Hide all phases
    document.querySelectorAll('.loading-phase').forEach(el => el.style.display = 'none');
    
    // Get user email from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
    
    // Phase 1: Typing
    const searchBarPhase = document.getElementById('searchBarPhase');
    const typedName = document.getElementById('typedName');
    const cursor = searchBarPhase.querySelector('.blinking-cursor');
    searchBarPhase.style.display = 'block';
    typedName.textContent = '';
    cursor.style.display = 'inline-block';
    
    // Create search query with name and email
    const searchQuery = `${userName} (${userEmail})`;
    
    let i = 0;
    const typeSpeed = Math.max(60, 1200 / Math.max(searchQuery.length, 6));
    function typeChar() {
        if (i < searchQuery.length) {
            typedName.textContent += searchQuery.charAt(i);
            i++;
            setTimeout(typeChar, typeSpeed);
        } else {
            setTimeout(() => {
                // Phase 2: Database Scan
                searchBarPhase.style.opacity = 1;
                searchBarPhase.style.transition = 'opacity 0.5s';
                searchBarPhase.style.opacity = 0;
                setTimeout(() => {
                    searchBarPhase.style.display = 'none';
                    showDbScanPhase();
                }, 500);
            }, 400);
        }
    }
    setTimeout(typeChar, 300);
    
    // Update progress when search starts
    updateFlowProgress('search_started');
}
function showDbScanPhase() {
    const dbScanPhase = document.getElementById('dbScanPhase');
    dbScanPhase.style.display = 'block';
    dbScanPhase.style.opacity = 0;
    dbScanPhase.style.transition = 'opacity 0.5s';
    setTimeout(() => { dbScanPhase.style.opacity = 1; }, 10);
    
    // Add progress bar
    const progressBar = document.createElement('div');
    progressBar.id = 'searchProgress';
    progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: #e2e8f0;
        border-radius: 2px;
        margin: 10px 0;
        overflow: hidden;
    `;
    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        width: 0%;
        transition: width 0.3s ease;
        border-radius: 2px;
    `;
    progressBar.appendChild(progressFill);
    dbScanPhase.insertBefore(progressBar, dbScanPhase.firstChild);
    
    // Animate scan lines with enhanced messages
    const scanLines = document.getElementById('scanLines');
    scanLines.innerHTML = '';
    
    let lines = [
        'Searching through 500+ databases...',
        'Checking 1,247 active settlements...',
        'Scanning: Data Privacy, Overdraft, Refunds...',
        'Cross-referencing with 89 government agencies...',
        'Checking Facebook settlement eligibility...',
        'Verifying Equifax breach claims...',
        'Scanning Wells Fargo overdraft settlements...',
        'Running fuzzy name matching algorithms...',
        'Checking claims from 2018-2024...',
        'Validating claim deadlines and statutes...',
        'Cross-referencing SSN patterns...',
        'Analyzing payout history across platforms...',
        'Verifying statute of limitations...',
        'Found potential matches in 3 categories...',
        'Calculating estimated settlement values...'
    ];
    
    let idx = 0;
    let progress = 0;
    
    function showLine() {
        if (idx < lines.length) {
            const line = document.createElement('div');
            line.textContent = lines[idx];
            line.style.opacity = 0;
            scanLines.appendChild(line);
            setTimeout(() => { line.style.opacity = 1; }, 50);
            
            // Update progress bar
            progress = ((idx + 1) / lines.length) * 100;
            progressFill.style.width = progress + '%';
            
            // Add progress percentage
            const progressText = document.createElement('div');
            progressText.textContent = `Searching... ${Math.round(progress)}% complete`;
            progressText.style.cssText = `
                font-size: 0.875rem;
                color: #6b7280;
                text-align: center;
                margin-top: 5px;
            `;
            
            // Remove previous progress text
            const prevProgress = dbScanPhase.querySelector('.progress-text');
            if (prevProgress) prevProgress.remove();
            
            progressText.className = 'progress-text';
            dbScanPhase.appendChild(progressText);
            
            idx++;
            setTimeout(showLine, 200);
        }
    }
    showLine();
    
    // Animate network graph
    renderNetworkGraph();
    
    setTimeout(() => {
        dbScanPhase.style.opacity = 1;
        dbScanPhase.style.transition = 'opacity 0.5s';
        dbScanPhase.style.opacity = 0;
        setTimeout(() => {
            dbScanPhase.style.display = 'none';
            showCardsPhase();
        }, 500);
    }, 3500); // Increased duration for more messages
}
function renderNetworkGraph() {
    const graph = document.getElementById('networkGraph');
    graph.innerHTML = '';
    // 4 nodes, connected
    const nodes = [
        {x:10, y:30}, {x:60, y:10}, {x:110, y:30}, {x:60, y:50}
    ];
    nodes.forEach((n, i) => {
        const node = document.createElement('div');
        node.className = 'network-node';
        node.style.left = n.x+'px';
        node.style.top = n.y+'px';
        node.style.animationDelay = (i*0.2)+'s';
        graph.appendChild(node);
    });
    // Links
    const links = [ [0,1],[1,2],[2,3],[3,0],[1,3] ];
    links.forEach(([a,b]) => {
        const n1 = nodes[a], n2 = nodes[b];
        const link = document.createElement('div');
        link.className = 'network-link';
        const dx = n2.x-n1.x, dy = n2.y-n1.y;
        const len = Math.sqrt(dx*dx+dy*dy);
        link.style.left = n1.x+8+'px';
        link.style.top = n1.y+8+'px';
        link.style.width = len+'px';
        link.style.transform = 'rotate('+(Math.atan2(dy,dx)*180/Math.PI)+'deg)';
        graph.appendChild(link);
    });
}
function showCardsPhase() {
    const cardsPhase = document.getElementById('cardsPhase');
    cardsPhase.style.display = 'block';
    cardsPhase.style.opacity = 0;
    cardsPhase.style.transition = 'opacity 0.5s';
    setTimeout(() => { cardsPhase.style.opacity = 1; }, 10);
    // Animate cards flying in
    const cards = [
        {el: document.getElementById('card1'), from:'left'},
        {el: document.getElementById('card2'), from:'right'},
        {el: document.getElementById('card3'), from:'top'},
        {el: document.getElementById('card4'), from:'bottom'}
    ];
    const positions = {
        left: 'translate(-220px, 0)',
        right: 'translate(220px, 0)',
        top: 'translate(0, -90px)',
        bottom: 'translate(0, 90px)'
    };
    cards.forEach((c, i) => {
        c.el.style.opacity = 0;
        c.el.style.transform = positions[c.from];
        c.el.classList.remove('blurred');
        setTimeout(() => {
            c.el.style.transition = 'transform 0.7s cubic-bezier(.7,.2,.2,1), opacity 0.5s';
            c.el.style.opacity = 1;
            c.el.style.transform = 'translate(0,0)';
        }, 200 + i*180);
    });
    // After all cards in, blur them
    setTimeout(() => {
        cards.forEach((c, i) => {
            setTimeout(() => {
                c.el.classList.add('blurred');
            }, i*120);
        });
    }, 1100);
    // Transition to blurred results
    setTimeout(() => {
        cardsPhase.style.opacity = 1;
        cardsPhase.style.transition = 'opacity 0.5s';
        cardsPhase.style.opacity = 0;
        setTimeout(() => {
            cardsPhase.style.display = 'none';
            showFunnelStep(3);
        }, 500);
    }, 1800);
    
    // Update progress when search completes
    updateFlowProgress('search_completed');
}

// Mobile menu toggle functionality
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (nav && toggle) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            nav.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            nav.classList.add('active');
            toggle.setAttribute('aria-expanded', 'true');
        }
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Make functions globally accessible
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToTop = scrollToTop;

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

// Settlement Spotlight Card Modal Logic
const modalOverlay = document.getElementById('settlementModalOverlay');
const modal = document.getElementById('settlementModal');
const modalTitle = document.getElementById('settlementModalTitle');
const modalDesc = document.getElementById('settlementModalDescription');
const modalClose = document.getElementById('settlementModalClose');
const cards = document.querySelectorAll('.spotlight-card');
function openSettlementModal(title, desc) {
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeSettlementModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
}
cards.forEach(card => {
    card.addEventListener('click', function(e) {
        e.preventDefault();
        openSettlementModal(
            card.getAttribute('data-title'),
            card.getAttribute('data-description')
        );
    });
});
modalClose.addEventListener('click', closeSettlementModal);
modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) closeSettlementModal();
});
document.addEventListener('keydown', function(e) {
    if (modalOverlay.style.display === 'flex' && (e.key === 'Escape' || e.key === 'Esc')) {
        closeSettlementModal();
    }
});

// Helper function to get referral source
function getReferralSource() {
    const referrer = document.referrer;
    console.log('Document referrer:', referrer);
    
    // Return the raw referrer, or 'direct' if empty
    return referrer || 'direct';
}

// Helper function to update flow progress
async function updateFlowProgress(progress) {
    const email = localStorage.getItem('userEmail');
    if (!email) {
        console.log('No email found, skipping progress update');
        return;
    }
    
    console.log('Updating flow progress to:', progress);
    
    try {
        const response = await fetch('/api/update-progress-simple', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                flowProgress: progress
            })
        });
        
        const data = await response.json();
        if (data.success) {
            console.log('Flow progress updated successfully:', progress);
        } else {
            console.error('Failed to update flow progress:', data.error);
        }
    } catch (error) {
        console.error('Error updating flow progress:', error);
    }
}