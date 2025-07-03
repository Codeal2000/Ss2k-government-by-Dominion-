document.addEventListener('DOMContentLoaded', () => {
    const timerDisplay = document.getElementById('timer');
    const cbtForm = document.getElementById('cbtForm');
    const resultsSection = document.getElementById('results');
    const objectiveScoreDisplay = document.getElementById('objectiveScore');
    const objectiveReviewDiv = document.getElementById('objectiveReview');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const currentQuestionNumberSpan = document.getElementById('current-question-number');
    const totalQuestionsSpan = document.getElementById('total-questions');
    const restartExamBtn = document.getElementById('restartExamBtn');

    const questionBlocks = Array.from(document.querySelectorAll('.question-block'));
    const totalQuestions = questionBlocks.length;
    let currentQuestionIndex = 0;

    const totalTime = 90 * 60; // 90 minutes in seconds
    let timeLeft = totalTime;
    let timerInterval;

    totalQuestionsSpan.textContent = totalQuestions;

    // --- Timer Functions ---
    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.innerHTML = `⏳ Time Left: ${formatTime(timeLeft)}`; // Update with emoji
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = "Time's Up!";
                alert("Time is up! Your exam has been automatically submitted.");
                submitExam();
            }
        }, 1000);
    }

    // --- Question Navigation Functions ---
    function showQuestion(index) {
        // Hide all questions with fade-out effect, then remove active class
        questionBlocks.forEach((block, i) => {
            if (block.classList.contains('active')) {
                block.classList.add('fade-out');
                setTimeout(() => {
                    block.classList.remove('active', 'fade-out');
                    block.style.position = 'absolute'; // Keep it off-flow
                    block.style.transform = 'translateX(100%)'; // Reset position
                }, 500); // Match CSS transition duration
            }
        });

        // Show the new question with fade-in effect
        const targetBlock = questionBlocks[index];
        if (targetBlock) {
             // Delay showing the new question slightly to allow fade-out to start
            setTimeout(() => {
                targetBlock.style.position = 'static'; // Take up space
                targetBlock.style.transform = 'translateX(0)'; // Slide in
                targetBlock.classList.add('active');
            }, 100); // Small delay

            currentQuestionIndex = index;
            currentQuestionNumberSpan.textContent = currentQuestionIndex + 1;
            updateNavigationButtons();
            // Scroll to top of question block for better UX
            targetBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function updateNavigationButtons() {
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === totalQuestions - 1;

        if (currentQuestionIndex === totalQuestions - 1) {
            submitBtn.style.display = 'block'; // Show submit button on last question
            nextBtn.style.display = 'none'; // Hide next button
        } else {
            submitBtn.style.display = 'none'; // Hide submit button
            nextBtn.style.display = 'block'; // Show next button
        }
    }

    // --- Submission & Grading Logic ---
    function submitExam() {
        clearInterval(timerInterval);
        const formData = new FormData(cbtForm);
        let objectiveCorrectCount = 0;
        objectiveReviewDiv.innerHTML = ''; // Clear previous results

        for (let i = 1; i <= 50; i++) { // Loop through all 50 objective questions
            const questionName = `q${i}`;
            const userAnswer = formData.get(questionName);
            const correctAnswerElement = cbtForm.querySelector(`input[name="${questionName}_answer"]`);
            const correctAnswer = correctAnswerElement ? correctAnswerElement.value : '';

            const questionBlock = cbtForm.querySelector(`.question-block[data-question-id="${i}"]`);
            const questionTextElement = questionBlock ? questionBlock.querySelector('.question-text') : null;
            const questionText = questionTextElement ? questionTextElement.textContent.trim() : `Question ${i}`;

            let isCorrect = false;
            let displayUserAnswer = '';

            // Handle Radio Button Answers
            if (questionBlock && questionBlock.querySelector('input[type="radio"]')) {
                if (userAnswer === correctAnswer) {
                    isCorrect = true;
                }
                displayUserAnswer = userAnswer ? `Option ${userAnswer.toUpperCase()}` : 'No answer selected.';
            }
            // Handle Text/Textarea Answers (Fill-in-the-blank, Short Answer)
            else if (questionBlock && (questionBlock.querySelector('input[type="text"]') || questionBlock.querySelector('textarea'))) {
                const userText = userAnswer ? userAnswer.trim().toLowerCase().replace(/\s+/g, '') : '';
                const correctTextOptions = correctAnswer.split(',').map(ans => ans.trim().toLowerCase().replace(/\s+/g, ''));

                if (correctTextOptions.length > 1) {
                    // For multi-part answers, check if all correct parts are contained in the user's answer
                    isCorrect = correctTextOptions.every(part => userText.includes(part));
                } else {
                    isCorrect = correctTextOptions.includes(userText);
                }
                displayUserAnswer = `"${userAnswer || 'No answer provided.'}"`;
            }

            if (isCorrect) {
                objectiveCorrectCount++;
            }

            const reviewItem = document.createElement('div');
            reviewItem.classList.add('objective-review-item', isCorrect ? 'correct' : 'incorrect');
            reviewItem.innerHTML = `
                <p class="review-question">${questionText}</p>
                <p class="review-answer user-answer">Your Answer: ${displayUserAnswer}</p>
                <p class="review-answer correct-answer">Correct Answer: "${correctAnswer}"</p>
            `;
            objectiveReviewDiv.appendChild(reviewItem);
        }

        objectiveScoreDisplay.textContent = `You scored ${objectiveCorrectCount} out of ${totalQuestions} objective questions!`;

        cbtForm.style.display = 'none';
        resultsSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Event Listeners ---
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            showQuestion(currentQuestionIndex + 1);
        }
    });

    cbtForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const confirmSubmit = confirm("Are you sure you want to finish the exam? You cannot make changes after submission.");
        if (confirmSubmit) {
            submitExam();
        }
    });

    restartExamBtn.addEventListener('click', () => {
        location.reload(); // Simple way to restart for this example
    });

    // --- Initial Setup ---
    resultsSection.style.display = 'none'; // Hide results until submitted
    submitBtn.style.display = 'none'; // Hide submit button initially
    showQuestion(currentQuestionIndex); // Display the first question
    startTimer(); // Start the countdown!
});
