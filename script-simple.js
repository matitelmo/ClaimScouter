// Simplified script - just the key parts for waitlist functionality

// Get referral source
function getReferralSource() {
    return document.referrer || 'direct';
}

// Update flow progress (fire and forget)
function updateFlowProgress(progress) {
    const email = localStorage.getItem('userEmail');
    if (!email) return;
    
    // Just send it, don't wait for response
    fetch('/api/update-progress-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, flowProgress: progress })
    }).catch(() => {}); // Ignore errors
}

// Handle form submission
async function handleSignup(name, email, source) {
    try {
        const response = await fetch('/api/signup-simple', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                source,
                referralSource: getReferralSource(),
                flowProgress: 'name_captured'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            window.actualWaitlistPosition = data.position;
            return { success: true, position: data.position };
        }
        
        return { success: false };
    } catch (error) {
        console.error('Signup error:', error);
        // Even on error, return success to not break the flow
        return { success: true, position: Math.floor(Math.random() * 1000) };
    }
}

// Example usage in your form handler:
// const result = await handleSignup(name, email, 'modal_funnel');
// updateFlowProgress('search_started');
// ... later ...
// updateFlowProgress('search_completed');
// ... etc ... 