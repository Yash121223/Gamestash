        let slideInd = 0;
        let timeout; 
        const slidesContainer = document.querySelector('.slides');
        const slides = document.querySelectorAll('.slide');
        const totalSlides = slides.length;
        const button1 = document.getElementById('button1');
        const button2 = document.getElementById('button2');

        button1.addEventListener('click', () => {
            slideInd--;
            if (slideInd < 0) {
                slideInd = totalSlides - 1;
            }
            updateSlidePosition();
        });

        button2.addEventListener('click', () => {
            slideInd++;
            if (slideInd >= totalSlides) {
                slideInd = 0;
            }
            updateSlidePosition();
        });

        function updateSlidePosition() {
            const slideWidth = slides[0].clientWidth;
            slidesContainer.style.transform = `translateX(-${slideInd * slideWidth}px)`;
        }

        function playClickSound() {
            document.getElementById('clickSound').play();
        }

        slides.forEach(handleSlideHover);

        function handleSlideHover(slide) {
            slide.addEventListener('mouseover', () => {
                slide.classList.add('hover');
            });
            slide.addEventListener('mouseout', () => {
                slide.classList.remove('hover');
            });
        }

        function changeSlideAutomatically() {
            timeout = setInterval(() => {
                slideInd++;
                if (slideInd >= totalSlides) {
                    slideInd = 0;
                }
                updateSlidePosition();
            }, 10000); // Change slide every 10 seconds (10000 milliseconds)
        }
        
        changeSlideAutomatically();

        