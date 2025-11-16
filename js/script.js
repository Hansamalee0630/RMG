// ==================== NAVIGATION ==================== //
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when link is clicked
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            setActiveNav();
        });
    });

    // Handle dropdown with proper event handling
    const dropdowns = document.querySelectorAll('.dropdown');
    let hideDropdownTimeout;
    
    dropdowns.forEach(dropdown => {
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        
        if (!dropdownMenu) return;
        
        // Show dropdown on hover over the dropdown container
        dropdown.addEventListener('mouseenter', function() {
            clearTimeout(hideDropdownTimeout);
            dropdownMenu.style.display = 'flex';
            dropdownMenu.style.opacity = '1';
            dropdownMenu.style.visibility = 'visible';
        });
        
        // Hide dropdown when leaving the dropdown container
        dropdown.addEventListener('mouseleave', function() {
            hideDropdownTimeout = setTimeout(() => {
                dropdownMenu.style.display = 'none';
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.visibility = 'hidden';
            }, 100);
        });
    });

    // Set active nav
    setActiveNav();
});

function setActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ==================== FAQ ACCORDION ==================== //
function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

// ==================== CONTACT FORM ==================== //
function setupContactForm() {
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Simple validation
            if (!data.name || !data.email || !data.message) {
                showMessage('Please fill in all required fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                showMessage('Please enter a valid email', 'error');
                return;
            }
            
            try {
                // Submit to Google Sheets via Apps Script
                const appScriptURL = 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/useweb?e=no';
                
                const payload = {
                    name: data.name,
                    email: data.email,
                    phone: data.phone || '',
                    service: data.service || 'Not specified',
                    message: data.message,
                    timestamp: new Date().toLocaleString()
                };
                
                // Try to submit to Google Sheets (optional - won't error if not configured)
                try {
                    await fetch(appScriptURL, {
                        method: 'POST',
                        body: JSON.stringify(payload),
                        mode: 'no-cors'
                    });
                } catch (err) {
                    console.log('Google Sheets submission skipped (not configured)');
                }
                
                // Show success message
                showMessage('Thank you! Your message has been sent successfully. We will contact you soon.', 'success');
                this.reset();
            } catch (error) {
                console.error('Form submission error:', error);
                showMessage('There was an error sending your message. Please try again.', 'error');
            }
        });
    }
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// ==================== PROPERTY FILTERS ==================== //
function setupPropertyFilters() {
    const filterInputs = document.querySelectorAll('.filter-group input, .filter-group select');
    const listings = document.querySelectorAll('.listing-card');
    
    filterInputs.forEach(input => {
        input.addEventListener('change', filterListings);
    });
    
    function filterListings() {
        const location = document.querySelector('select[name="location"]')?.value || '';
        const minPrice = parseFloat(document.querySelector('input[name="min-price"]')?.value || 0);
        const maxPrice = parseFloat(document.querySelector('input[name="max-price"]')?.value || Infinity);
        
        listings.forEach(listing => {
            let show = true;
            
            if (location && !listing.dataset.location?.includes(location)) {
                show = false;
            }
            
            const price = parseFloat(listing.dataset.price || 0);
            if (price < minPrice || price > maxPrice) {
                show = false;
            }
            
            listing.style.display = show ? 'block' : 'none';
        });
    }
}

// ==================== SMOOTH SCROLL ==================== //
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ==================== WHATSAPP AND CALL BUTTONS ==================== //
function setupContactButtons() {
    const whatsappBtn = document.querySelectorAll('[data-whatsapp]');
    const callBtn = document.querySelectorAll('[data-call]');
    
    whatsappBtn.forEach(btn => {
        const phone = btn.dataset.whatsapp;
        const message = btn.dataset.message || 'Hello, I am interested in your services.';
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        });
    });
    
    callBtn.forEach(btn => {
        const phone = btn.dataset.call;
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = `tel:${phone}`;
        });
    });
}

// ==================== ANIMATION ON SCROLL ==================== //
function setupScrollAnimations() {
    const elements = document.querySelectorAll('.service-card, .testimonial-card, .blog-card, .listing-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// ==================== INITIALIZE ALL ==================== //
window.addEventListener('load', function() {
    setupFAQ();
    setupContactForm();
    setupPropertyFilters();
    setupContactButtons();
    setupScrollAnimations();
});

// Add styles for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
