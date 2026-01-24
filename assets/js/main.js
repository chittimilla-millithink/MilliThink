document.addEventListener('DOMContentLoaded', function () {
    // Smooth scrolling for in-page anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // only handle pure hash links (on same page)
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Active nav on scroll
    function updateActiveNav() {
        let current = '';
        const sections = document.querySelectorAll('section[id]');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href') || '';
            if (href === `#${current}`) link.classList.add('active');
        });
    }
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // Popup functions (accepts message and type)
    window.showPopup = function(message = '', type = 'success') {
        const popup = document.getElementById('popup');
        const overlay = document.getElementById('popupOverlay');
        const titleEl = document.getElementById('popupTitle');
        const msgEl = document.getElementById('popupMessage');
        if (!popup || !overlay || !titleEl || !msgEl) return;

        // set state class
        popup.classList.remove('success', 'error');
        popup.classList.add(type === 'error' ? 'error' : 'success');

        // set title and message
        titleEl.textContent = (type === 'error') ? 'Submission failed' : 'Thank you';
        msgEl.textContent = message || (type === 'error' ? 'There was an error submitting the form. Please try again later.' : 'Thank you for reaching out to us with your request. We sincerely appreciate your consideration and will contact you as soon as possible to assist you.');

        popup.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    };

    window.closePopup = function() {
        const popup = document.getElementById('popup');
        const overlay = document.getElementById('popupOverlay');
        if (popup && overlay) {
            popup.style.display = 'none';
            overlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Attach close handlers to overlay and close buttons
    const overlayEl = document.getElementById('popupOverlay');
    if (overlayEl) overlayEl.addEventListener('click', closePopup);
    document.querySelectorAll('.popup-close').forEach(btn => btn.addEventListener('click', closePopup));

    // Basic client-side validation
    function validateForm(form) {
        let valid = true;
        // clear previous errors
        form.querySelectorAll('.error-text').forEach(el => el.remove());

        const name = form.querySelector('[name="name"]');
        const email = form.querySelector('[name="email"]');
        const message = form.querySelector('[name="message"]');

        function showError(field, text) {
            valid = false;
            const err = document.createElement('div');
            err.className = 'error-text';
            err.style.color = '#e53e3e';
            err.style.marginTop = '0.5rem';
            err.style.fontSize = '0.9rem';
            err.textContent = text;
            field.parentNode.appendChild(err);
        }

        if (!name || name.value.trim().length < 2) showError(name || form, 'Please enter your name');
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) showError(email || form, 'Please enter a valid email');
        if (!message || message.value.trim().length < 10) showError(message || form, 'Please enter a message (at least 10 characters)');

        return valid;
    }

    // lightweight analytics hook
    function trackEvent(name, data) {
        try {
            if (window.dataLayer && typeof window.dataLayer.push === 'function') {
                window.dataLayer.push({ event: name, ...data });
            } else {
                // fallback: console log
                console.log('trackEvent', name, data);
            }
        } catch (err) {
            console.warn('trackEvent failed', err);
        }
    }

    // Form handler for any form inside .contact-form
    document.querySelectorAll('.contact-form form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            if (!validateForm(this)) return;

            const formData = new FormData(this);

            // POST using fetch
            fetch(this.action, {
                method: this.method || 'POST',
                body: formData
            })
            .then(response => {
                // attempt to parse json but ignore errors
                try { return response.json(); } catch (err) { return {}; }
            })
            .then(() => {
                this.reset();
                trackEvent('contact_submitted', { service: formData.get('service') });
                showPopup('', 'success');
            })
            .catch(err => {
                console.error('Form submit error', err);
                trackEvent('contact_submit_error', { error: String(err) });
                showPopup('There was an error submitting your request. Please try again later.', 'error');
            });
        });
    });
});