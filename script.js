// Quiz Application State
        let quizState = {
            selectedLanguage: '',
            selectedDifficulty: '',
            questions: [],
            currentQuestionIndex: 0,
            userAnswers: [],
            score: 0,
            startTime: null,
            endTime: null,
            timerInterval: null
        };

        // DOM Elements
        const selectionScreen = document.getElementById('selectionScreen');
        const quizContainer = document.getElementById('quizContainer');
        const resultsContainer = document.getElementById('resultsContainer');
        const reviewContainer = document.getElementById('reviewContainer');
        
        const languageSelect = document.getElementById('languageSelect');
        const difficultySelect = document.getElementById('difficultySelect');
        const startQuizBtn = document.getElementById('startQuizBtn');
        
        const quizLanguage = document.getElementById('quizLanguage');
        const quizDifficulty = document.getElementById('quizDifficulty');
        const questionNumber = document.getElementById('questionNumber');
        const timer = document.getElementById('timer');
        const progressBar = document.getElementById('progressBar');
        const questionText = document.getElementById('questionText');
        const optionsContainer = document.getElementById('optionsContainer');
        const prevQuestionBtn = document.getElementById('prevQuestionBtn');
        const nextQuestionBtn = document.getElementById('nextQuestionBtn');
        const finishQuizBtn = document.getElementById('finishQuizBtn');
        
        const scoreValue = document.getElementById('scoreValue');
        const correctAnswers = document.getElementById('correctAnswers');
        const incorrectAnswers = document.getElementById('incorrectAnswers');
        const answeredQuestions = document.getElementById('answeredQuestions');
        const unansweredQuestions = document.getElementById('unansweredQuestions');
        const timeTaken = document.getElementById('timeTaken');
        const accuracyPercentage = document.getElementById('accuracyPercentage');
        const reviewAnswersBtn = document.getElementById('reviewAnswersBtn');
        const restartQuizBtn = document.getElementById('restartQuizBtn');
        
        const backToResultsBtn = document.getElementById('backToResultsBtn');
        const newQuizBtn = document.getElementById('newQuizBtn');
        const reviewQuestionsContainer = document.getElementById('reviewQuestionsContainer');
        
        const notification = document.getElementById('notification');
       
        // Event Listeners
        startQuizBtn.addEventListener('click', startQuiz);
        prevQuestionBtn.addEventListener('click', goToPreviousQuestion);
        nextQuestionBtn.addEventListener('click', goToNextQuestion);
        finishQuizBtn.addEventListener('click', finishQuiz);
        reviewAnswersBtn.addEventListener('click', showReview);
        restartQuizBtn.addEventListener('click', restartSameQuiz);
        backToResultsBtn.addEventListener('click', backToResults);
        newQuizBtn.addEventListener('click', newQuiz);

        // Functions
        function startQuiz() {
            const language = languageSelect.value;
            const difficulty = difficultySelect.value;
            
            if (!language || !difficulty) {
                showNotification('Please select both a programming language and difficulty level.', 'error');
                return;
            }
            
            quizState.selectedLanguage = language;
            quizState.selectedDifficulty = difficulty;
            quizState.questions = selectQuestions(language, difficulty);
            quizState.currentQuestionIndex = 0;
            quizState.userAnswers = new Array(quizState.questions.length).fill(null);
            quizState.score = 0;
            quizState.startTime = new Date();
            
            // Show start quiz message
            showNotification(`Quiz started! Good luck with your ${getLanguageDisplayName(language)} ${difficulty} quiz!`, 'success');

            selectionScreen.style.display = 'none';
            quizContainer.style.display = 'block';
            
            quizLanguage.textContent = getLanguageDisplayName(language);
            quizDifficulty.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
            
            startTimer();
            displayQuestion();
        }
        
        function selectQuestions(language, difficulty) {
            const allQuestions = questionDatabase[language][difficulty];
            const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
            return shuffledQuestions.slice(0, 20);
        }
        
        function getLanguageDisplayName(language) {
            const languageNames = {
                'html': 'HTML',
                'css': 'CSS',
                'javascript': 'JavaScript',
                'c': 'C',
                'cpp': 'C++',
                'java': 'Java',
                'python': 'Python',
                'react': 'React',
                'php': 'PHP',
                'dsa': 'Data Structures & Algorithms',
                'mysql': 'MySQL'
            };
            return languageNames[language] || language;
        }
        
        function startTimer() {
            quizState.timerInterval = setInterval(updateTimer, 1000);
        }
        
        function updateTimer() {
            const now = new Date();
            const elapsed = Math.floor((now - quizState.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            timer.textContent = `${minutes}:${seconds}`;
        }
        
        function displayQuestion() {
            const question = quizState.questions[quizState.currentQuestionIndex];
            questionText.textContent = question.question;
            
            // Update question number and progress bar
            questionNumber.textContent = `${quizState.currentQuestionIndex + 1}/${quizState.questions.length}`;
            const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Clear previous options
            optionsContainer.innerHTML = '';
            
            // Shuffle options
            const shuffledOptions = [...question.options].map((option, index) => ({
                text: option,
                originalIndex: index
            })).sort(() => Math.random() - 0.5);
            
            // Display shuffled options
            shuffledOptions.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.index = option.originalIndex;
                
                const optionLetter = document.createElement('div');
                optionLetter.className = 'option-letter';
                optionLetter.textContent = String.fromCharCode(65 + index); // A, B, C, D
                
                const optionText = document.createElement('div');
                optionText.textContent = option.text;
                
                optionElement.appendChild(optionLetter);
                optionElement.appendChild(optionText);
                
                // Check if this option was previously selected
                if (quizState.userAnswers[quizState.currentQuestionIndex] === option.originalIndex) {
                    optionElement.classList.add('selected');
                }
                
                optionElement.addEventListener('click', () => selectOption(option.originalIndex));
                optionsContainer.appendChild(optionElement);
            });
            
            // Update navigation buttons
            prevQuestionBtn.disabled = quizState.currentQuestionIndex === 0;
            
            if (quizState.currentQuestionIndex === quizState.questions.length - 1) {
                nextQuestionBtn.style.display = 'none';
                finishQuizBtn.style.display = 'flex';
            } else {
                nextQuestionBtn.style.display = 'flex';
                finishQuizBtn.style.display = 'none';
            }
        }
        
        function selectOption(optionIndex) {
            quizState.userAnswers[quizState.currentQuestionIndex] = optionIndex;
            
            // Update UI to show selected option
            const options = optionsContainer.querySelectorAll('.option');
            options.forEach(option => {
                option.classList.remove('selected');
                if (parseInt(option.dataset.index) === optionIndex) {
                    option.classList.add('selected');
                }
            });
        }
        
        function goToPreviousQuestion() {
            if (quizState.currentQuestionIndex > 0) {
                quizState.currentQuestionIndex--;
                displayQuestion();
            }
        }
        
        function goToNextQuestion() {
            if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
                quizState.currentQuestionIndex++;
                displayQuestion();
            }
        }
        
        function finishQuiz() {
            // Stop timer
            clearInterval(quizState.timerInterval);
            quizState.endTime = new Date();
            
            // Calculate score
            quizState.score = 0;
            let answeredCount = 0;
            
            quizState.questions.forEach((question, index) => {
                if (quizState.userAnswers[index] !== null) {
                    answeredCount++;
                    if (quizState.userAnswers[index] === question.correctAnswer) {
                        quizState.score++;
                    } 
                }
            });
    
            // Show finish quiz message
            const percentage = Math.round((quizState.score / quizState.questions.length) * 100);
            let message = '';
            
            if (percentage >= 90) {
                message = `Quiz completed! Excellent score: ${percentage}% (${quizState.score}/${quizState.questions.length})`;
            } else if (percentage >= 70) {
                message = `Quiz completed! Good job: ${percentage}% (${quizState.score}/${quizState.questions.length})`;
            } else if (percentage >= 50) {
                message = `Quiz completed! Not bad: ${percentage}% (${quizState.score}/${quizState.questions.length})`;
            } else {
                message = `Quiz completed! Keep practicing: ${percentage}% (${quizState.score}/${quizState.questions.length})`;
            }
    
            showNotification(message, 'success');
                    
            // Show results
            quizContainer.style.display = 'none';
            resultsContainer.style.display = 'block';
            
            // Update results UI
            scoreValue.textContent = `${percentage}%`;
            document.getElementById('scoreCircle').style.setProperty('--percentage', `${percentage}%`);
            
            correctAnswers.textContent = quizState.score;
            answeredQuestions.textContent = answeredCount;
            unansweredQuestions.textContent = quizState.questions.length - answeredCount;
            incorrectAnswers.textContent = answeredCount - quizState.score;
            const elapsed = Math.floor((quizState.endTime - quizState.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            timeTaken.textContent = `${minutes}:${seconds}`;
            
            accuracyPercentage.textContent = `${percentage}%`;

            // Update result message based on score
            const resultMessage = document.getElementById('resultMessage');
            if (percentage >= 90) {
                resultMessage.textContent = 'Excellent! You have a great understanding of this topic!';
            } else if (percentage >= 70) {
                resultMessage.textContent = 'Good job! You have a solid grasp of the concepts.';
            } else if (percentage >= 50) {
                resultMessage.textContent = 'Not bad! With a bit more practice, you can improve.';
            } else {
                resultMessage.textContent = 'Keep studying! Practice makes perfect.';
            }
        }
        
         function showReview() {
            resultsContainer.style.display = 'none';
            reviewContainer.style.display = 'block';
            
            // Clear previous review questions
            reviewQuestionsContainer.innerHTML = '';
            
            // Display each question and answer
            quizState.questions.forEach((question, index) => {
                const reviewQuestion = document.createElement('div');
                reviewQuestion.className = 'review-question';
                
                const questionText = document.createElement('div');
                questionText.className = 'review-question-text';
                questionText.textContent = `Question ${index + 1}: ${question.question}`;
                reviewQuestion.appendChild(questionText);
                
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'review-options';
                
                // Display options with correct/incorrect indicators
                question.options.forEach((option, optionIndex) => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'review-option';
                    
                    if (optionIndex === question.correctAnswer) {
                        optionElement.classList.add('correct');
                    }
                    
                    if (quizState.userAnswers[index] === optionIndex && optionIndex !== question.correctAnswer) {
                        optionElement.classList.add('incorrect');
                    }
                    
                    if (quizState.userAnswers[index] === optionIndex) {
                        optionElement.classList.add('selected');
                    }
                    
                    const optionLetter = document.createElement('span');
                    optionLetter.textContent = `${String.fromCharCode(65 + optionIndex)}. `;
                    
                    const optionText = document.createElement('span');
                    optionText.textContent = option;
                    
                    optionElement.appendChild(optionLetter);
                    optionElement.appendChild(optionText);
                    optionsContainer.appendChild(optionElement);
                });
                
                reviewQuestion.appendChild(optionsContainer);
                reviewQuestionsContainer.appendChild(reviewQuestion);
            });
        }

        // Function to restart the same quiz (same language and difficulty)
        function restartSameQuiz() {
            // Show restart message with language and difficulty
            const languageName = getLanguageDisplayName(quizState.selectedLanguage);
            const difficultyName = quizState.selectedDifficulty.charAt(0).toUpperCase() + quizState.selectedDifficulty.slice(1);
            showNotification(`Restarting your ${languageName} ${difficultyName} quiz...`, 'info');
            
            // Generate a new set of questions (reshuffled from the database)
            quizState.questions = selectQuestions(quizState.selectedLanguage, quizState.selectedDifficulty);
            
            // Reset the user's answers
            quizState.currentQuestionIndex = 0;
            quizState.userAnswers = new Array(quizState.questions.length).fill(null);
            quizState.score = 0;
            
            // Reset the timer
            clearInterval(quizState.timerInterval);
            quizState.startTime = new Date();
            
            // Hide results screen and show quiz screen
            resultsContainer.style.display = 'none';
            quizContainer.style.display = 'block';
            
            // Update quiz header with language and difficulty
            quizLanguage.textContent = languageName;
            quizDifficulty.textContent = difficultyName;
            
            // Start the timer and display the first question
            startTimer();
            displayQuestion();
        }
        
        function backToResults() {
            reviewContainer.style.display = 'none';
            resultsContainer.style.display = 'block';
        }
        
        function restartQuiz() {
            resultsContainer.style.display = 'none';
            selectionScreen.style.display = 'block';
            
            // Reset form
            languageSelect.value = '';
            difficultySelect.value = '';

            
            // Show restart message
            showNotification('Quiz restarted. Select a language and difficulty to start again.', 'info');
        }

        function newQuiz() {
            resultsContainer.style.display = 'none';
            selectionScreen.style.display = 'block';
            
            // Reset form
            languageSelect.value = '';
            difficultySelect.value = '';

            // Show new quiz message
            showNotification('Ready for a new quiz? Select a language and difficulty to begin.', 'info');
        }
        
        function showNotification(message, type = 'success') {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);

        }

