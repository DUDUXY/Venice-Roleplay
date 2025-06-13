document.addEventListener('DOMContentLoaded', () => {
    // --- Verificação e Registro de Plugins GSAP ---
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' ||
        typeof Draggable === 'undefined' || typeof TextPlugin === 'undefined' ||
        typeof CustomEase === 'undefined' || typeof MotionPathPlugin === 'undefined') {
        console.error("GSAP ou plugins não carregados. As animações podem não funcionar.");
        return;
    }
    gsap.registerPlugin(ScrollTrigger, Draggable, TextPlugin, CustomEase, MotionPathPlugin);

    // --- Variáveis Globais (Cores e Elementos Comuns) ---
    const primaryColors = {
        'primary-purple': '#4A087F',
        'dark-purple': '#0D001A',
        'light-purple': '#9B5DCC',
        'pure-white': '#FFFFFF',
        'off-white': '#F0F0F0',
        'text-dark': '#333333'
    };

    const qs = (selector, parent = document) => parent.querySelector(selector);
    const qsa = (selector, parent = document) => parent.querySelectorAll(selector);
    const addClass = (element, className) => element.classList.add(className);
    const removeClass = (element, className) => element.classList.remove(className);
    const toggleClass = (element, className) => element.classList.toggle(className);
    const hasClass = (element, className) => element.classList.contains(className);

    // --- Sons (A Trilha Sonora da Realidade Alterada) ---
    const soundCache = {};
    const playSound = (src, volume = 0.5, loop = false) => {
        if (!soundCache[src]) {
            try {
                const audio = new Audio(src);
                audio.volume = volume;
                audio.loop = loop;
                soundCache[src] = audio;
            } catch (e) {
                console.warn(`Erro ao carregar áudio ${src}:`, e);
                return null;
            }
        }
        const audio = soundCache[src];
        if (audio) {
            audio.currentTime = 0; // Reinicia o som
            audio.play().catch(e => console.warn(`Erro ao reproduzir som ${src}:`, e));
        }
        return audio;
    };

    // --- Efeitos Visuais Complexos ---
    // Partículas visuais
    const createParticleBurst = (x, y, color, count = 15, size = 6, spread = 60) => {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            addClass(particle, 'visual-particle');
            document.body.appendChild(particle);

            gsap.set(particle, {
                x: x,
                y: y,
                backgroundColor: color,
                width: size,
                height: size,
                borderRadius: '50%',
                pointerEvents: 'none',
                opacity: 1,
                zIndex: 9998,
                boxShadow: `0 0 ${size * 2}px ${color}`
            });

            gsap.to(particle, {
                x: x + (Math.random() - 0.5) * spread * 2,
                y: y + (Math.random() - 0.5) * spread * 2,
                opacity: 0,
                scale: 0,
                rotation: Math.random() * 360,
                duration: 1.2 + Math.random() * 0.8, // Duração maior
                ease: 'power3.out',
                onComplete: () => particle.remove()
            });
        }
    };

    // Glitch Effect (para títulos e textos importantes)
    const applyGlitchEffect = (element, duration = 1.0) => {
        addClass(element, 'glitch-text');
        gsap.to(element, {
            duration: duration,
            onComplete: () => removeClass(element, 'glitch-text')
        });
        playSound('sounds/glitch_effect.mp3', 0.4);
    };

    // Hero Section Background (Canvas ou WebGL para um ruído cósmico)
    function initHeroBackground() {
        const canvasContainer = qs('#hero-section .hero-background-canvas');
        if (!canvasContainer) return;

        const canvas = document.createElement('canvas');
        canvasContainer.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        let width, height;
        const resizeCanvas = () => {
            width = canvas.width = canvasContainer.clientWidth;
            height = canvas.height = canvasContainer.clientHeight;
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const particles = [];
        const numParticles = 50; // Mais partículas
        const particleSize = 3;

        class CosmicParticle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5; // Movimento mais lento
                this.vy = (Math.random() - 0.5) * 0.5;
                this.alpha = Math.random() * 0.5 + 0.1; // Mais transparência
                this.size = Math.random() * particleSize + 1;
                this.color = primaryColors['light-purple']; // Partículas roxas claras
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= 0.005; // Fade out mais rápido

                if (this.alpha <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                    this.reset();
                }
            }

            reset() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.alpha = Math.random() * 0.5 + 0.1;
            }

            draw() {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`; // Partículas brancas
                ctx.shadowColor = `rgba(155, 93, 204, ${this.alpha * 2})`; // Sombra roxa
                ctx.shadowBlur = this.size * 3;
                ctx.fill();
                ctx.restore();
            }
        }

        for (let i = 0; i < numParticles; i++) {
            particles.push(new CosmicParticle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height); // Limpa o canvas a cada frame
            ctx.fillStyle = primaryColors['dark-purple']; // Fundo escuro para o canvas
            ctx.fillRect(0, 0, width, height);

            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }


    // --- Inicialização Geral ---
    const initApp = () => {
        // Set current year in footer
        qs('#current-year').textContent = new Date().getFullYear();

        // Custom Eases
        CustomEase.create("elasticOut", "M0,0 C0.166,0.015 0.518,0.732 0.824,0.732 0.948,0.732 0.963,0.963 1,1");
        CustomEase.create("vortexIn", "M0,0 C0.42,0 0.58,1 1,1");
        CustomEase.create("quantumShift", "M0,0 C0.1,0 0.1,1 1,1"); // Para transições mais abruptas e surreais

        initGlobalAnimations();
        initHeroSection();
        initHeaderAnimations();
        initScrollAnimations();
        initCardInteractions(); // Unificado para categorias, produtos e hubs
        initProductInteractions(); // Específico para o carrinho
        initNavigationTransitions();
        initModals(); // Inclui login e cadastro
        initCursorEffect();
        initHeroBackground(); // Inicializa o background do canvas
    };

    // --- Animações Globais e Utilitários ---
    function initGlobalAnimations() {
        gsap.to('body', { // Parallax sutil no corpo
            backgroundPosition: "0% 15%",
            ease: 'none',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
            }
        });
    }

    // --- Header e Navegação ---
    function initHeaderAnimations() {
        const header = qs('#main-header');
        gsap.fromTo(header,
            { y: -120, opacity: 0, filter: 'blur(15px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out', delay: 0.8 }
        );

        gsap.from(qsa('#main-nav li'), { opacity: 0, y: -30, stagger: 0.1, duration: 0.9, ease: 'back.out(1.5)', delay: 1.2 });
        gsap.from(qsa('.header-actions .icon-button'), { opacity: 0, x: 30, stagger: 0.1, duration: 0.9, ease: 'back.out(1.5)', delay: 1.5 });

        // Logo Pulse Glow
        const logo = qs('.logo-container');
        if (logo) {
            logo.addEventListener('mouseenter', () => {
                gsap.to(logo.querySelector('.logo-icon'), {
                    rotation: 360, duration: 1.5, ease: 'elasticOut', repeat: 1, yoyo: true,
                    filter: `drop-shadow(0 0 15px ${primaryColors['pure-white']}) drop-shadow(0 0 30px ${primaryColors['light-purple']})`
                });
                gsap.to(logo.querySelector('.logo-text'), {
                    color: primaryColors['pure-white'],
                    textShadow: `0 0 12px ${primaryColors['pure-white']}, 0 0 25px ${primaryColors['light-purple']}`,
                    duration: 0.5, yoyo: true, repeat: 1
                });
                playSound('sounds/logo_pulse.mp3', 0.2);
            });
        }

        // Nav Links hover effect
        qsa('#main-nav li a').forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(link, {
                    color: primaryColors['pure-white'],
                    textShadow: `0 0 10px ${primaryColors['pure-white']}, 0 0 20px ${primaryColors['light-purple']}`,
                    duration: 0.3
                });
                gsap.to(link.querySelector('::after'), {
                    width: '100%',
                    ease: 'elasticOut'
                });
                playSound('sounds/link_hover_soft.mp3', 0.1);
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, {
                    color: primaryColors['off-white'],
                    textShadow: 'none',
                    duration: 0.3
                });
                gsap.to(link.querySelector('::after'), {
                    width: '0%',
                    ease: 'power2.out'
                });
            });
        });
    }

    // --- Hero Section (A Dissolução da Realidade) ---
    function initHeroSection() {
        const heroContent = qs('#hero-section .hero-content');
        const heroTitle = qs('#hero-section .heading-split-text');
        const heroSubheading = qs('#hero-section .subheading-fade-in');
        const heroCtaButton = qs('#hero-section .cta-button');

        const tlHero = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tlHero.fromTo(heroContent,
            { opacity: 0, y: 100, scale: 0.9, filter: 'blur(25px)' },
            { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 2, delay: 1.5,
              onStart: () => playSound('sounds/hero_reveal_ambient.mp3', 0.6)
            }
        )
        .from(heroTitle.children, // Anima cada palavra
            { opacity: 0, y: 60, scale: 0.8, filter: 'blur(20px)', stagger: 0.15, duration: 1.2, ease: 'back.out(2)',
              onComplete: () => applyGlitchEffect(heroTitle, 0.6) // Glitch sutil
            }, '<0.4'
        )
        .fromTo(heroSubheading,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, '<0.6'
        )
        .fromTo(heroCtaButton,
            { opacity: 0, scale: 0.7, filter: 'blur(15px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'elasticOut(1, 0.5)' }, '<0.6'
        );

        // CTA button vortex effect (on hover)
        heroCtaButton.addEventListener('mouseenter', () => {
            gsap.to(heroCtaButton, {
                boxShadow: `0 0 50px ${primaryColors['primary-purple']}, 0 0 90px ${primaryColors['pure-white']}, 0 0 120px ${primaryColors['light-purple']}`,
                duration: 0.4
            });
            gsap.to(heroCtaButton, {
                '--gradient-angle': '360deg', // Animação de gradiente
                duration: 1.5,
                ease: 'linear',
                repeat: -1,
                yoyo: true
            });
            playSound('sounds/cta_vortex_hum.mp3', 0.3);
        });
        heroCtaButton.addEventListener('mouseleave', () => {
            gsap.to(heroCtaButton, {
                boxShadow: `0 0 25px rgba(74, 8, 127, 0.8), 0 0 50px rgba(74, 8, 127, 0.6)`,
                duration: 0.4
            });
            gsap.killTweensOf(heroCtaButton); // Para a animação de gradiente
        });
    }

    // --- Animações de Scroll (Revelação de Seções) ---
    function initScrollAnimations() {
        qsa('.section-title, .category-card, .product-card, .hub-card, .register-form-container, .dedication-content, .contact-form, #main-footer').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                y: 100,
                scale: 0.9,
                filter: 'blur(20px)',
                duration: 1.5,
                ease: 'power3.out',
                stagger: 0.1,
                onStart: () => {
                    if (el.classList.contains('section-title')) {
                        applyGlitchEffect(el, 0.7);
                    }
                    if (hasClass(el, 'category-card') || hasClass(el, 'product-card') || hasClass(el, 'hub-card')) {
                         playSound('sounds/card_reveal_sparkle.mp3', 0.1);
                    }
                }
            });
        });

        // Dedication signature drawing
        const dedicationSignature = qs('.dedication-signature');
        const signatureLine = qs('.signature-line');
        if (dedicationSignature && signatureLine) {
            gsap.from(signatureLine, {
                scrollTrigger: {
                    trigger: signatureLine,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
                width: 0,
                opacity: 0,
                duration: 1.5,
                ease: 'power3.out'
            });
            gsap.from(dedicationSignature, {
                scrollTrigger: {
                    trigger: dedicationSignature,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                y: 50,
                duration: 1.2,
                delay: 0.5,
                ease: 'power2.out'
            });
        }
    }

    // --- Interações de Cards (Categorias, Produtos, Hubs) ---
    function initCardInteractions() {
        qsa('.category-card, .product-card, .hub-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    transform: 'translateY(-25px) scale(1.06) rotateZ(2deg)',
                    boxShadow: `0 25px 60px ${primaryColors['primary-purple']}, 0 0 90px ${primaryColors['pure-white']}`,
                    borderColor: primaryColors['pure-white'],
                    duration: 0.5,
                    ease: 'elasticOut'
                });
                gsap.to(card.querySelector('img'), {
                    scale: 1.2,
                    filter: 'brightness(1.2) saturate(1.2)',
                    duration: 0.8
                });
                if (card.querySelector('.card-overlay')) {
                    gsap.to(card.querySelector('.card-overlay'), { opacity: 1, duration: 0.6 });
                }
                playSound('sounds/card_hover_deep.mp3', 0.1);
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    transform: 'translateY(0) scale(1) rotateZ(0deg)',
                    boxShadow: `0 0 10px rgba(74, 8, 127, 0.2)`,
                    borderColor: `rgba(255, 255, 255, 0.1)`,
                    duration: 0.5,
                    ease: 'back.out(1.7)'
                });
                gsap.to(card.querySelector('img'), {
                    scale: 1,
                    filter: 'brightness(0.8) saturate(0.8)',
                    duration: 0.8
                });
                if (card.querySelector('.card-overlay')) {
                    gsap.to(card.querySelector('.card-overlay'), { opacity: 0, duration: 0.6 });
                }
            });
        });

        // Product badge flicker (specific for product cards)
        qsa('.product-badge').forEach(badge => {
            gsap.to(badge, {
                filter: `drop-shadow(0 0 15px ${primaryColors['pure-white']}) brightness(1.5)`,
                repeat: -1, yoyo: true, duration: 1.5, ease: 'sine.inOut',
                delay: Math.random() * 0.5
            });
        });
    }

    // --- Sistema de Compras (Carrinho e Animação de Item) ---
    function initProductInteractions() {
        const cartCountBubble = qs('#cart-btn .cart-count-bubble');
        const cartIconContainer = qs('#cart-btn');

        qsa('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const productImgSrc = btn.dataset.img;
                const productName = btn.dataset.name;

                // Create a temporary flying image
                const flyingImg = document.createElement('img');
                flyingImg.src = productImgSrc;
                addClass(flyingImg, 'flying-product-effect');
                document.body.appendChild(flyingImg);

                const btnRect = btn.getBoundingClientRect();
                const cartRect = cartIconContainer.getBoundingClientRect();

                gsap.set(flyingImg, {
                    x: btnRect.left + btnRect.width / 2 - 40, // Centered on button
                    y: btnRect.top + btnRect.height / 2 - 40,
                    opacity: 1,
                    scale: 1,
                    rotation: 0,
                    filter: 'blur(0px) brightness(1) hue-rotate(0deg)'
                });

                gsap.to(flyingImg, {
                    motionPath: {
                        path: [
                            { x: btnRect.left + btnRect.width / 2, y: btnRect.top + btnRect.height / 2 },
                            { x: btnRect.left + (cartRect.left - btnRect.left) / 2 + Math.random() * 100 - 50, y: btnRect.top - 150 + Math.random() * 100 - 50 }, // Arc upwards
                            { x: cartRect.left + cartRect.width / 2, y: cartRect.top + cartRect.height / 2 }
                        ],
                        curviness: 1.5,
                        autoRotate: false
                    },
                    width: 30,
                    height: 30,
                    opacity: 0,
                    scale: 0.2,
                    rotation: 720, // Spin multiple times
                    filter: `blur(10px) brightness(0.2) hue-rotate(270deg)`, // More extreme filter
                    duration: 2.0, // Longer duration for complex path
                    ease: 'power4.inOut',
                    onStart: () => {
                        createParticleBurst(e.clientX, e.clientY, primaryColors['light-purple'], 25, 10, 100);
                        playSound('sounds/item_select_burst.mp3', 0.6);
                    },
                    onUpdate: function() {
                        const progress = this.progress();
                        if (progress > 0.3) { // Start glow mid-flight
                            gsap.set(flyingImg, {
                                boxShadow: `0 0 ${20 * progress}px ${primaryColors['pure-white']}, 0 0 ${40 * progress}px ${primaryColors['light-purple']}`
                            });
                        }
                    },
                    onComplete: () => {
                        flyingImg.remove();
                        let currentCount = parseInt(cartCountBubble.textContent);
                        cartCountBubble.textContent = currentCount + 1;
                        gsap.fromTo(cartCountBubble,
                            { scale: 0.4, opacity: 0, y: -20, filter: 'blur(8px)' },
                            { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'back.out(2.8)' }
                        );
                        gsap.fromTo(cartIconContainer.querySelector('i'),
                            { rotation: 0, scale: 1 },
                            { rotation: 90, scale: 1.4, duration: 0.4, yoyo: true, repeat: 1, ease: 'power3.out' }
                        );
                        playSound('sounds/item_arrive_cart.mp3', 0.7);
                    }
                });
            });
        });
    }

    // --- Transições de Navegação (Ruptura Espaço-Tempo) ---
    function initNavigationTransitions() {
        const navLinks = qsa('#main-nav a, .logo-container, .cta-button, .forgot-password a, .register-link a, .login-link a, .view-details-btn, .hub-cta');
        const pageTransitionOverlay = qs('#page-transition-overlay');
        const mainHeader = qs('#main-header'); // Certifique-se de que está definido

        navLinks.forEach(link => {
            if (link.id === 'login-btn' || link.id === 'register-btn' || link.classList.contains('add-to-cart-btn')) return;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetHref = link.getAttribute('href');

                if (targetHref && targetHref.startsWith('#')) {
                    gsap.to(window, {
                        duration: 1.8, // Mais suave
                        scrollTo: {
                            y: targetHref,
                            offsetY: mainHeader.offsetHeight + 30
                        },
                        ease: 'power4.inOut',
                        onStart: () => {
                            gsap.to('body', { filter: 'blur(7px) brightness(0.6) saturate(1.8) hue-rotate(30deg)', duration: 0.6, yoyo: true, repeat: 1 });
                            playSound('sounds/scroll_warp.mp3', 0.4);
                        }
                    });
                    return;
                }

                // Full page transition for external links or if you want to force it
                const tlTransition = gsap.timeline({
                    onComplete: () => {
                        window.location.href = targetHref;
                    }
                });

                tlTransition.fromTo(pageTransitionOverlay,
                    { opacity: 0, scale: 0, filter: 'blur(0px) brightness(1)', borderRadius: '50%', background: `radial-gradient(circle at center, ${primaryColors['pure-white']} 0%, transparent 100%)` },
                    {
                        opacity: 1,
                        scale: 1.7, // Expande mais ainda
                        filter: 'blur(30px) brightness(0.2) hue-rotate(180deg)', // Mais blur, escuro, shift de cor para o roxo
                        background: `radial-gradient(circle at center, ${primaryColors['pure-white']} 0%, ${primaryColors['light-purple']} 25%, ${primaryColors['primary-purple']} 70%, ${primaryColors['dark-purple']} 100%)`,
                        duration: 2.5, // Duração maior
                        ease: 'quantumShift', // Custom ease
                        borderRadius: '0%', // Se torna quadrado
                        onStart: () => {
                            pageTransitionOverlay.style.visibility = 'visible';
                            playSound('sounds/page_quantum_shift.mp3', 1.0);
                            gsap.to(pageTransitionOverlay, { rotation: 720, duration: 4, ease: 'linear', repeat: -1 }); // Rotação infinita mais rápida
                        }
                    }
                )
                .to('body', { opacity: 0, duration: 1.0, delay: -1.5, filter: 'blur(15px) brightness(0.3)' }, '<');
            });
        });
    }

    // --- Modals (Login e Cadastro - O Portão da Consciência) ---
    let modalBackgroundAudio = null; // Para controlar o áudio de fundo do modal

    function initModals() {
        const loginModal = qs('#login-modal');
        const registerModal = qs('#register-section'); // A seção de registro se torna o "modal" nesse caso
        const loginForm = qs('#login-form');
        const registerForm = qs('#register-form');
        const loginBtn = qs('#login-btn');
        const registerBtn = qs('#register-btn');
        const closeModalBtn = qs('.close-modal-btn');
        const openRegisterFromLogin = qs('#open-register-from-login');
        const openLoginFromRegister = qs('#open-login-from-register');

        // Functions to open/close modals
        const openModal = (modalElement) => {
            addClass(modalElement, 'is-active');
            modalElement.setAttribute('aria-hidden', 'false');
            modalElement.style.pointerEvents = 'auto';

            modalBackgroundAudio = playSound('sounds/modal_ambient_loop.mp3', 0.4, true);

            const tlOpen = gsap.timeline({ defaults: { ease: 'power3.out' } });
            tlOpen.set(modalElement, { opacity: 0, scale: 0.5, filter: 'blur(40px) brightness(0.1)' })
                .to(modalElement, {
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px) brightness(1)',
                    duration: 1.8,
                    onStart: () => playSound('sounds/cosmic_expand.mp3', 0.8)
                })
                .fromTo(modalElement.querySelector('.login-modal-content') || modalElement.querySelector('.register-form-container'),
                    { opacity: 0, y: 180, scale: 0.6, filter: 'blur(25px)', rotateX: 45, transformOrigin: 'center bottom' },
                    { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', rotateX: 0, duration: 1.5, ease: 'power4.out',
                      onComplete: () => {
                          gsap.to(modalElement.querySelector('.login-modal-content') || modalElement.querySelector('.register-form-container'),
                              { boxShadow: `0 0 100px ${primaryColors['primary-purple']}, 0 0 180px ${primaryColors['pure-white']}`, repeat: -1, yoyo: true, duration: 5, ease: 'sine.inOut' }
                          );
                      }
                    }, '<0.5'
                )
                .from(modalElement.querySelector('.login-title') || modalElement.querySelector('.section-title'), {
                    opacity: 0, y: -100, duration: 1.2, ease: 'back.out(2.5)',
                    onComplete: () => applyGlitchEffect(modalElement.querySelector('.login-title') || modalElement.querySelector('.section-title'), 0.9)
                }, '<0.6')
                .from(modalElement.querySelectorAll('.input-group'), {
                    opacity: 0, y: 60, stagger: 0.25, duration: 1.0, ease: 'power3.out'
                }, '<0.5')
                .from(modalElement.querySelector('.submit-button'), {
                    opacity: 0, scale: 0.5, duration: 1.2, ease: 'elasticOut(1, 0.6)'
                }, '<0.7')
                .from(modalElement.querySelectorAll('.forgot-password, .register-link, .login-link'), {
                    opacity: 0, y: 40, stagger: 0.2, duration: 0.8
                }, '<0.4');
        };

        const closeAllModals = () => {
            const activeModal = qs('.login-portal-modal.is-active');
            if (!activeModal) return;

            const tlClose = gsap.timeline({
                defaults: { ease: 'power3.in' },
                onComplete: () => {
                    removeClass(activeModal, 'is-active');
                    activeModal.setAttribute('aria-hidden', 'true');
                    activeModal.style.pointerEvents = 'none';
                    if (modalBackgroundAudio) modalBackgroundAudio.pause();
                }
            });

            gsap.to(activeModal.querySelector('.close-icon path'), {
                strokeDashoffset: 300,
                opacity: 0,
                scale: 0.2,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power4.in'
            });

            tlClose.to(activeModal.querySelector('.login-modal-content') || activeModal.querySelector('.register-form-container'), {
                opacity: 0, y: -150, scale: 0.6, filter: 'blur(30px) brightness(0.4)', duration: 1.0,
                onStart: () => playSound('sounds/modal_shrink_dissolve.mp3', 0.7)
            })
            .to(activeModal, {
                opacity: 0,
                scale: 0.4,
                filter: 'blur(40px) brightness(0.1)',
                duration: 1.2
            }, '<0.2');
        };

        // Event listeners for opening/closing
        loginBtn.addEventListener('click', () => openModal(loginModal));
        registerBtn.addEventListener('click', () => {
            // Smooth scroll to register section
            gsap.to(window, {
                duration: 1.5,
                scrollTo: { y: '#register-section', offsetY: mainHeader.offsetHeight + 30 },
                ease: 'power4.inOut',
                onComplete: () => {
                    // No modal overlay, just focus/animate the section
                    playSound('sounds/section_focus_activate.mp3', 0.5);
                    gsap.fromTo(registerModal.querySelector('.register-form-container'),
                        { opacity: 0, scale: 0.9, y: 50 },
                        { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'back.out(1.7)' }
                    );
                }
            });
        });
        closeModalBtn.addEventListener('click', closeAllModals);
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeAllModals();
            }
        });

        // Switch between login and register forms
        openRegisterFromLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals(); // Close current login modal
            setTimeout(() => { // Give time for transition
                gsap.to(window, {
                    duration: 1.5,
                    scrollTo: { y: '#register-section', offsetY: mainHeader.offsetHeight + 30 },
                    ease: 'power4.inOut',
                    onComplete: () => {
                        playSound('sounds/section_focus_activate.mp3', 0.5);
                        gsap.fromTo(registerModal.querySelector('.register-form-container'),
                            { opacity: 0, scale: 0.9, y: 50 },
                            { opacity: 1, scale: 1, y: 0, duration: 1.0, ease: 'back.out(1.7)' }
                        );
                    }
                });
            }, 800); // Small delay to allow close animation to start
        });

        openLoginFromRegister.addEventListener('click', (e) => {
            e.preventDefault();
            // Assuming register is a section, not a modal that needs explicit closing
            openModal(loginModal);
        });


        // --- Form Validation (Melhorado) ---
        const validateForm = (form, isRegister = false) => {
            let isValid = true;
            const inputGroups = qsa('.input-group', form);

            inputGroups.forEach(group => {
                const input = group.querySelector('input, textarea');
                const feedback = group.querySelector('.input-feedback');
                feedback.textContent = ''; // Clear previous messages
                removeClass(input, 'is-invalid');

                if (input.hasAttribute('required') && !input.value.trim()) {
                    feedback.textContent = 'Este campo é essencial para a sua existência.';
                    addClass(input, 'is-invalid');
                    isValid = false;
                    playSound('sounds/form_error_alert.mp3', 0.6);
                    gsap.fromTo(input, {x: -10}, {x: 10, repeat: 5, yoyo: true, duration: 0.05, ease: 'none'});
                    return;
                }

                if (input.type === 'email' && input.value.trim() && !/\S+@\S+\.\S+/.test(input.value)) {
                    feedback.textContent = 'Frequência eletrônica inválida.';
                    addClass(input, 'is-invalid');
                    isValid = false;
                    playSound('sounds/form_error_alert.mp3', 0.6);
                    gsap.fromTo(input, {x: -10}, {x: 10, repeat: 5, yoyo: true, duration: 0.05, ease: 'none'});
                    return;
                }

                if (input.type === 'password' && input.value.trim().length < 6) {
                    feedback.textContent = 'Seu selo de acesso deve ter no mínimo 6 glifos.';
                    addClass(input, 'is-invalid');
                    isValid = false;
                    playSound('sounds/form_error_alert.mp3', 0.6);
                    gsap.fromTo(input, {x: -10}, {x: 10, repeat: 5, yoyo: true, duration: 0.05, ease: 'none'});
                    return;
                }

                if (isRegister && input.id === 'reg-confirm-password') {
                    const passwordInput = qs('#reg-password', form);
                    if (input.value !== passwordInput.value) {
                        feedback.textContent = 'Os selos de acesso não coincidem. Reinsira.';
                        addClass(input, 'is-invalid');
                        isValid = false;
                        playSound('sounds/form_error_alert.mp3', 0.6);
                        gsap.fromTo(input, {x: -10}, {x: 10, repeat: 5, yoyo: true, duration: 0.05, ease: 'none'});
                        return;
                    }
                }
            });

            return isValid;
        };

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(loginForm)) {
                // Simulate async login
                const submitBtn = qs('.submit-button.activate-portal', loginForm);
                const glif = qs('.login-glif', loginForm);
                const originalText = submitBtn.querySelector('.glif-text').textContent;

                gsap.timeline({
                    onStart: () => {
                        submitBtn.disabled = true;
                        submitBtn.querySelector('.glif-text').textContent = 'Conectando...';
                        playSound('sounds/portal_activate_long.mp3', 1.0);
                        createParticleBurst(e.clientX, e.clientY, primaryColors['pure-white'], 60, 12, 120);
                        gsap.to(glif, {
                            rotation: 1440, // Multiple spins
                            strokeDashoffset: -1000, // Longer dashoffset
                            duration: 3.0,
                            ease: 'power4.inOut',
                            filter: `brightness(6) drop-shadow(0 0 40px ${primaryColors['pure-white']})`,
                        });
                    },
                    onComplete: () => {
                        submitBtn.querySelector('.glif-text').textContent = originalText;
                        submitBtn.disabled = false;
                        gsap.fromTo(glif, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: 'power1.out' }); // Hide glif
                        console.log('Login bem-sucedido: Sua consciência foi sincronizada!');
                        closeAllModals();
                    }
                }).to(submitBtn, {
                    scale: 1.1, y: -5, boxShadow: `0 0 70px ${primaryColors['pure-white']}, inset 0 0 35px ${primaryColors['light-purple']}`,
                    duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1
                });
            }
        });

        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm(registerForm, true)) {
                const submitBtn = qs('.submit-button.activate-portal', registerForm);
                const glif = qs('.register-glif', registerForm);
                const originalText = submitBtn.querySelector('.glif-text').textContent;

                gsap.timeline({
                    onStart: () => {
                        submitBtn.disabled = true;
                        submitBtn.querySelector('.glif-text').textContent = 'Sincronizando...';
                        playSound('sounds/register_confirm_spark.mp3', 0.9);
                        createParticleBurst(e.clientX, e.clientY, primaryColors['pure-white'], 80, 15, 150);
                        gsap.to(glif.querySelectorAll('circle, path'), {
                            strokeDashoffset: -1000,
                            duration: 3.5,
                            ease: 'power4.inOut',
                            filter: `brightness(8) drop-shadow(0 0 50px ${primaryColors['pure-white']})`,
                            stagger: 0.1
                        });
                    },
                    onComplete: () => {
                        submitBtn.querySelector('.glif-text').textContent = originalText;
                        submitBtn.disabled = false;
                        gsap.to(glif.querySelectorAll('circle, path'), { opacity: 0, duration: 0.5, ease: 'power1.out' }); // Hide glif
                        console.log('Registro bem-sucedido: Novo avatar criado no fluxo!');
                        // Pode redirecionar ou mostrar mensagem de sucesso
                        // Para este exemplo, apenas limpa o formulário e rola para o topo
                        registerForm.reset();
                        qsa('.input-feedback', registerForm).forEach(fb => fb.textContent = '');
                        qsa('input, textarea', registerForm).forEach(input => removeClass(input, 'is-invalid'));
                        gsap.to(window, { duration: 1.0, scrollTo: { y: '#hero-section' }, ease: 'power2.out' });
                    }
                }).to(submitBtn, {
                    scale: 1.1, y: -5, boxShadow: `0 0 80px ${primaryColors['pure-white']}, inset 0 0 40px ${primaryColors['light-purple']}`,
                    duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1
                });
            }
        });
    }

    // --- Efeito de Cursor Interativo (O Olhar da Percepção) ---
    function initCursorEffect() {
        const cursor = qs('.custom-cursor');
        const innerCursor = qs('.custom-cursor-inner');

        window.addEventListener('mousemove', e => {
            gsap.to(cursor, { duration: 0.4, x: e.clientX, y: e.clientY, ease: 'power3.out' });
            gsap.to(innerCursor, { duration: 0.1, x: e.clientX, y: e.clientY, ease: 'power1.out' });
        });

        qsa('a, button, input[type="submit"], .product-card, .category-card, .hub-card, input, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 1.8, opacity: 0.8, duration: 0.3, ease: 'back.out(1.9)', backgroundColor: primaryColors['primary-purple'] });
                gsap.to(innerCursor, { scale: 0.3, opacity: 0.6, backgroundColor: primaryColors['pure-white'] });
                playSound('sounds/cursor_hover_soft.mp3', 0.05); // Som suave
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.9)', backgroundColor: 'transparent' });
                gsap.to(innerCursor, { scale: 1, opacity: 1, backgroundColor: primaryColors['pure-white'] });
            });
        });
    }

    // Initialize everything
    initApp();
});