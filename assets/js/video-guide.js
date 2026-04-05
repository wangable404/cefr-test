/**
 * Video Guide - Interactive functionality
 * Pixel-perfect implementation following existing project patterns
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // DOM Elements
    // ═══════════════════════════════════════════════════════════════
    
    const backBtn = document.getElementById('backBtn');
    const videoItems = document.querySelectorAll('.video-guide-item');
    const videoModal = document.getElementById('videoModal');
    const modalClose = document.getElementById('modalClose');
    const videoFrame = document.getElementById('videoFrame');

    // ═══════════════════════════════════════════════════════════════
    // Back Button Navigation
    // ═══════════════════════════════════════════════════════════════
    
    if (backBtn) {
        backBtn.addEventListener('click', handleBackClick);
        
        // Keyboard accessibility
        backBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleBackClick();
            }
        });
    }

    function handleBackClick() {
        // Add click feedback animation
        backBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            backBtn.style.transform = '';
        }, 150);

        // Navigate back or to home
        if (document.referrer && document.referrer !== window.location.href) {
            window.history.back();
        } else {
            window.location.href = './index.html';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // Video Item Interactions
    // ═══════════════════════════════════════════════════════════════
    
    if (videoItems.length > 0) {
        videoItems.forEach((item, index) => {
            // Click handler
            item.addEventListener('click', () => {
                const videoUrl = item.getAttribute('data-video');
                if (videoUrl) {
                    openVideoModal(videoUrl);
                }
            });

            // Keyboard accessibility
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const videoUrl = item.getAttribute('data-video');
                    if (videoUrl) {
                        openVideoModal(videoUrl);
                    }
                }
            });

            // Enhanced hover effects via JS (backup for CSS)
            item.addEventListener('mouseenter', () => {
                const icon = item.querySelector('.video-guide-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(3deg)';
                }
            });

            item.addEventListener('mouseleave', () => {
                const icon = item.querySelector('.video-guide-icon');
                if (icon) {
                    icon.style.transform = '';
                }
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // Modal Functions
    // ═══════════════════════════════════════════════════════════════
    
    function openVideoModal(url) {
        if (!videoModal || !videoFrame) return;

        // Convert YouTube watch URL to embed URL
        let embedUrl = url;
        if (url.includes('youtube.com/watch')) {
            const videoId = new URL(url).searchParams.get('v');
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            }
        }

        // Set iframe source
        videoFrame.src = embedUrl;

        // Show modal with animation
        videoModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus trap - focus first focusable element
        setTimeout(() => {
            if (modalClose) modalClose.focus();
        }, 100);
    }

    function closeVideoModal() {
        if (!videoModal || !videoFrame) return;

        // Hide modal
        videoModal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear iframe src to stop video
        videoFrame.src = '';
    }

    // Modal close button
    if (modalClose) {
        modalClose.addEventListener('click', closeVideoModal);
        
        modalClose.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeVideoModal();
            }
        });
    }

    // Close modal on background click
    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeVideoModal();
            }
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
        }
    });

    // ═══════════════════════════════════════════════════════════════
    // Scroll-triggered animations (progressive enhancement)
    // ═══════════════════════════════════════════════════════════════
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.1 });

        videoItems.forEach(item => {
            observer.observe(item);
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // Touch device optimizations
    // ═══════════════════════════════════════════════════════════════
    
    if ('ontouchstart' in window) {
        // Add touch feedback
        videoItems.forEach(item => {
            item.addEventListener('touchstart', () => {
                item.style.transition = 'none';
            }, { passive: true });
            
            item.addEventListener('touchend', () => {
                item.style.transition = '';
            }, { passive: true });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // Initialize - Add loaded class for any post-load animations
    // ═══════════════════════════════════════════════════════════════
    
    window.addEventListener('load', () => {
        document.body.classList.add('video-guide-loaded');
        
        // Log for debugging (remove in production)
        console.log('Video Guide initialized successfully');
    });

})();
