// Plant Friend App
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const welcomeModal = document.getElementById('welcome-modal');
    const notificationModal = document.getElementById('notification-modal');
    const startBtn = document.getElementById('start-btn');
    const plantNameInput = document.getElementById('plant-name-input');
    const notificationTitle = document.getElementById('notification-title');
    const notificationText = document.getElementById('notification-text');
    const notificationBtn = document.getElementById('notification-btn');
    const waterBtn = document.getElementById('water-btn');
    const taskBtn = document.getElementById('task-btn');
    const completeTaskBtn = document.getElementById('complete-task-btn');
    const skipTaskBtn = document.getElementById('skip-task-btn');
    const plant = document.getElementById('plant');
    const dayCounter = document.getElementById('day-counter');
    const waterLevel = document.getElementById('water-level');
    const growthLevel = document.getElementById('growth-level');
    const plantInfo = document.getElementById('plant-info');
    const waterDrops = document.getElementById('water-drops');
    const taskPanel = document.getElementById('task-panel');
    const taskDescription = document.getElementById('task-description');
    const taskTimer = document.getElementById('task-timer');
    const taskProgress = document.getElementById('task-progress');
    const sun = document.querySelector('.sun');
    const moon = document.querySelector('.moon');
    const rain = document.getElementById('rain');
    const settingsModal = document.getElementById("settings-modal");
    const settingsBtn = document.getElementById("settings-btn");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const notifyWaterCheckbox = document.getElementById("notify-water");
    const notifyTaskCheckbox = document.getElementById("notify-task");
    const soundEffectsCheckbox = document.getElementById("sound-effects");
    const backgroundMusicCheckbox = document.getElementById("background-music");
    const difficultySelect = document.getElementById("difficulty");
    const potNameElement = document.getElementById("pot-name");
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('help-btn'); // Ensure you have a button with this ID in your HTML
    const closeHelpBtn = document.getElementById('close-help-btn');
    
    // Plant States
    const MAX_GROWTH_DAYS = 100;
    const MAX_WATER_LEVEL = 100;
    const WATER_DECREASE_RATE = 15; // % per day
    const WITHERING_THRESHOLD = 40; // % water level
    
    let plantState = {
        name: '',
        day: 1,
        waterLevel: 100,
        growth: 1,
        lastWatered: new Date(),
        lastVisit: new Date(),
        withering: false,
        taskLevel: 1,
        currentTask: null,
        taskStartTime: null,
        taskDuration: 0,
        taskCompleted: false
    };

    // Tasks
    const tasks = [
        { 
            description: "Go 10 minutes without checking your phone", 
            duration: 10 * 60, // seconds
            difficulty: 1
        },
        { 
            description: "Take your plant for a 5-minute walk", 
            duration: 5 * 60,
            difficulty: 1
        },
        { 
            description: "Do a quick stretching session", 
            duration: 3 * 60,
            difficulty: 1
        },
        { 
            description: "Go 30 minutes without checking your phone", 
            duration: 30 * 60,
            difficulty: 2
        },
        { 
            description: "Take your plant for a 15-minute walk", 
            duration: 15 * 60,
            difficulty: 2
        },
        { 
            description: "Finish a small task that isn't due yet", 
            duration: 20 * 60,
            difficulty: 2
        },
        { 
            description: "Go 1 hour without checking your phone", 
            duration: 60 * 60,
            difficulty: 3
        },
        { 
            description: "Take your plant for a 30-minute walk or exercise", 
            duration: 30 * 60,
            difficulty: 3
        },
        { 
            description: "Complete a project that isn't due for a few days", 
            duration: 45 * 60,
            difficulty: 3
        },
        { 
            description: "Go 2 hours without checking your phone", 
            duration: 120 * 60,
            difficulty: 4
        },
        { 
            description: "Take your plant on a 1-mile walk", 
            duration: 20 * 60,
            difficulty: 4
        },
        { 
            description: "Complete a significant project ahead of schedule", 
            duration: 60 * 60,
            difficulty: 4
        }
    ];

    // Initialize the app
    initApp();

    function initApp() {
        // Check if returning user
        const savedPlant = localStorage.getItem('plantFriend');
        if (savedPlant) {
            plantState = JSON.parse(savedPlant);
            plantState.lastVisit = new Date(plantState.lastVisit);
            plantState.lastWatered = new Date(plantState.lastWatered);
            
            // Calculate days passed since last visit
            const currentDate = new Date();
            const daysSinceLastVisit = Math.floor((currentDate - new Date(plantState.lastVisit)) / (1000 * 60 * 60 * 24));
            
            if (daysSinceLastVisit > 0) {
                // Update water level based on days passed
                plantState.waterLevel = Math.max(0, plantState.waterLevel - (daysSinceLastVisit * WATER_DECREASE_RATE));
                
                // Update plant day counter
                plantState.day += daysSinceLastVisit;
                if (plantState.day > MAX_GROWTH_DAYS) {
                    plantState.day = MAX_GROWTH_DAYS;
                }
                
                // Update growth based on new day
                updateGrowth();
                
                // Check if plant is withering
                checkWithering();
                
                // Reset current task
                plantState.currentTask = null;
                plantState.taskStartTime = null;
                plantState.taskCompleted = false;
                
                // Show returning notification
                if (daysSinceLastVisit === 1) {
                    showNotification("Welcome Back!", `You've been away for 1 day. Your plant ${plantState.name} missed you!`);
                } else {
                    showNotification("Welcome Back!", `You've been away for ${daysSinceLastVisit} days. Your plant ${plantState.name} missed you!`);
                }
            }
            
            // Update lastVisit
            plantState.lastVisit = new Date();
            
            // Update UI
            updateUI();
        } else {
            // Show welcome modal for new users
            welcomeModal.style.display = 'flex';
        }
        
        // Initialize weather based on time and actual weather
        updateWeather();
        
        // Set up event listeners
        setupEventListeners();
        
        // Save state every minute
        setInterval(savePlantState, 60000);
    }

    function setupEventListeners() {
        startBtn.addEventListener('click', function() {
            const plantName = plantNameInput.value.trim();

            if (plantName) {
                potNameElement.textContent = plantName; // Update the pot name
                welcomeModal.style.display = "none"; // Close the welcome modal
                plantState.name = plantName;
                showNotification("Let's Grow!", `Meet ${plantName}, your new plant friend! Water it daily and help it grow by completing tasks.`);
                savePlantState();
                updateUI();
            } else {
                alert("Please enter a name for your plant!"); // Prompt user to enter a name
            }
        });
        
        notificationBtn.addEventListener('click', function() {
            notificationModal.style.display = 'none';
        });
        
        waterBtn.addEventListener('click', waterPlant);
        taskBtn.addEventListener('click', getNewTask);
        completeTaskBtn.addEventListener('click', completeTask);
        skipTaskBtn.addEventListener('click', skipTask);
        
        settingsBtn.addEventListener("click", () => {
            settingsModal.style.display = "flex";
        });

        closeSettingsBtn.addEventListener("click", () => {
            settingsModal.style.display = "none";
        });

        saveSettingsBtn.addEventListener("click", () => {
            const settings = {
                notifyWater: notifyWaterCheckbox.checked,
                notifyTask: notifyTaskCheckbox.checked,
                soundEffects: soundEffectsCheckbox.checked,
                backgroundMusic: backgroundMusicCheckbox.checked,
                difficulty: difficultySelect.value,
            };

            // Save settings to localStorage
            localStorage.setItem("plantPalSettings", JSON.stringify(settings));

            // Close the modal
            settingsModal.style.display = "none";

            // Apply settings (example: toggle background music)
            applySettings(settings);
        });

        // Load settings on page load
        const savedSettings = JSON.parse(localStorage.getItem("plantPalSettings"));
        if (savedSettings) {
            notifyWaterCheckbox.checked = savedSettings.notifyWater;
            notifyTaskCheckbox.checked = savedSettings.notifyTask;
            soundEffectsCheckbox.checked = savedSettings.soundEffects;
            backgroundMusicCheckbox.checked = savedSettings.backgroundMusic;
            difficultySelect.value = savedSettings.difficulty;

            // Apply settings
            applySettings(savedSettings);
        }

        // Check time and update weather periodically
        setInterval(updateWeather, 60000); // Every minute
        
        // Check water level periodically
        setInterval(checkWaterDecrease, 3600000); // Every hour

        // Open the help modal
        if (helpBtn) {
            helpBtn.addEventListener('click', function () {
                helpModal.style.display = 'flex';
            });
        }

        // Close the help modal
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', function () {
                helpModal.style.display = 'none';
            });
        }
    }

    function applySettings(settings) {
        if (settings.backgroundMusic) {
            // Example: Start background music
            console.log("Background music enabled");
        } else {
            // Example: Stop background music
            console.log("Background music disabled");
        }

        if (settings.soundEffects) {
            console.log("Sound effects enabled");
        } else {
            console.log("Sound effects disabled");
        }

        console.log(`Difficulty set to: ${settings.difficulty}`);
    }

    function updateGrowth() {
        // Calculate growth percentage based on days
        plantState.growth = Math.min(100, Math.floor((plantState.day / MAX_GROWTH_DAYS) * 100));
        
        // Update plant visualization based on growth
        updatePlantVisualization();
    }

    function updatePlantVisualization() {
        // Clear current plant
        while (plant.children.length > 1) {
            plant.removeChild(plant.lastChild);
        }
        
        const stem = plant.querySelector('.stem');
        
        // Set stem height based on growth
        const maxHeight = 300; // max stem height in px
        const stemHeight = Math.max(20, (plantState.growth / 100) * maxHeight);
        stem.style.height = `${stemHeight}px`;
        
        // Add leaves based on growth
        const numLeaves = Math.floor(plantState.growth / 5) + 1; // One new leaf per 5% growth
        
        for (let i = 0; i < numLeaves; i++) {
            if (i > 20) break; // Limit to 20 leaves
            
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            
            // Calculate leaf size based on position (smaller at top)
            const leafPosition = i / numLeaves;
            const leafSize = 35 - (leafPosition * 15);
            
            leaf.style.width = `${leafSize}px`;
            leaf.style.height = `${leafSize}px`;
            
            // Position the leaf along the stem
            const yPos = stemHeight - (stemHeight * leafPosition) - (leafSize / 2);
            
            // Alternate sides
            const leftPos = i % 2 === 0 ? -leafSize + 4 : 4;
            
            leaf.style.bottom = `${yPos}px`;
            leaf.style.left = `${leftPos}px`;
            
            // Rotate leaves slightly for variety
            const rotation = i % 2 === 0 ? '45deg' : '135deg';
            leaf.style.transform = `rotate(${rotation})`;
            
            plant.appendChild(leaf);
        }
        
        // Add flower for well-grown plants
        if (plantState.growth >= 70) {
            const flower = document.createElement('div');
            flower.className = 'flower';
            flower.style.position = 'absolute';
            flower.style.top = `-30px`;
            flower.style.left = '50%';
            flower.style.transform = 'translateX(-50%)';
            flower.style.width = '40px';
            flower.style.height = '40px';
            flower.style.borderRadius = '50%';
            flower.style.background = plantState.growth >= 90 ? '#FFC107' : '#FF9800';
            
            const innerFlower = document.createElement('div');
            innerFlower.style.position = 'absolute';
            innerFlower.style.top = '50%';
            innerFlower.style.left = '50%';
            innerFlower.style.transform = 'translate(-50%, -50%)';
            innerFlower.style.width = '20px';
            innerFlower.style.height = '20px';
            innerFlower.style.borderRadius = '50%';
            innerFlower.style.background = plantState.growth >= 90 ? '#FF5722' : '#F57C00';
flower.appendChild(innerFlower);

// Add petals for fully grown plants
if (plantState.growth >= 90) {
for (let i = 0; i < 8; i++) {
    const petal = document.createElement('div');
    petal.style.position = 'absolute';
    petal.style.width = '15px';
    petal.style.height = '25px';
    petal.style.background = '#FFEB3B';
    petal.style.borderRadius = '50%';
    petal.style.top = '50%';
    petal.style.left = '50%';
    petal.style.transformOrigin = '0 0';
    petal.style.transform = `rotate(${i * 45}deg) translate(-50%, -100%) translateY(-20px)`;
    flower.appendChild(petal);
}
}

plant.appendChild(flower);
}

// Update withering status
if (plantState.withering) {
plant.classList.add('withering');
} else {
plant.classList.remove('withering');
}
}

function checkWithering() {
if (plantState.waterLevel < WITHERING_THRESHOLD) {
plantState.withering = true;
} else {
plantState.withering = false;
}
}

function waterPlant() {
// Reset water level
plantState.waterLevel = MAX_WATER_LEVEL;
plantState.lastWatered = new Date();
plantState.withering = false;

// Show water animation
createWaterAnimation();

// Update UI
updateUI();
savePlantState();

// Show notification for certain growth milestones
if (plantState.growth === 25) {
showNotification("Growth Milestone!", `${plantState.name} has reached 25% growth! Keep going!`);
} else if (plantState.growth === 50) {
showNotification("Halfway There!", `${plantState.name} is now 50% grown! You're doing great!`);
} else if (plantState.growth === 75) {
showNotification("Almost There!", `${plantState.name} is 75% grown and looking beautiful!`);
} else if (plantState.growth === 100) {
showNotification("Fully Grown!", `Congratulations! ${plantState.name} is now fully grown! What an achievement!`);
}
}

function createWaterAnimation() {
waterDrops.style.display = 'block';
waterDrops.innerHTML = '';

// Create water drops
for (let i = 0; i < 15; i++) {
const drop = document.createElement('div');
drop.className = 'drop';

// Random position
drop.style.left = `${Math.random() * 100}%`;

// Random delay
drop.style.animationDelay = `${Math.random() * 0.5}s`;

waterDrops.appendChild(drop);
}

// Hide water drops after animation
setTimeout(() => {
waterDrops.style.display = 'none';
}, 1500);
}

function getNewTask() {
if (plantState.currentTask) {
showNotification("Task In Progress", "You already have an active task. Complete or skip it before getting a new one.");
return;
}

// Filter tasks by difficulty based on plant growth
let availableTasks = [];
if (plantState.growth < 25) {
availableTasks = tasks.filter(task => task.difficulty === 1);
} else if (plantState.growth < 50) {
availableTasks = tasks.filter(task => task.difficulty <= 2);
} else if (plantState.growth < 75) {
availableTasks = tasks.filter(task => task.difficulty <= 3);
} else {
availableTasks = tasks;
}

// Select random task
const randomIndex = Math.floor(Math.random() * availableTasks.length);
plantState.currentTask = availableTasks[randomIndex];
plantState.taskStartTime = new Date();
plantState.taskDuration = plantState.currentTask.duration;
plantState.taskCompleted = false;

// Show task panel
taskPanel.style.display = 'block';
taskDescription.textContent = plantState.currentTask.description;

// Start timer
updateTaskTimer();
const timerInterval = setInterval(() => {
if (!plantState.currentTask) {
    clearInterval(timerInterval);
    return;
}
updateTaskTimer();
}, 1000);

// Enable complete button after 80% of time passed
setTimeout(() => {
if (plantState.currentTask) {
    completeTaskBtn.disabled = false;
}
}, plantState.taskDuration * 1000 * 0.8);

savePlantState();
}

function updateTaskTimer() {
if (!plantState.currentTask || !plantState.taskStartTime) return;

const now = new Date();
const elapsed = Math.floor((now - new Date(plantState.taskStartTime)) / 1000);
const remaining = Math.max(0, plantState.taskDuration - elapsed);

// Format time as HH:MM:SS
const hours = Math.floor(remaining / 3600);
const minutes = Math.floor((remaining % 3600) / 60);
const seconds = remaining % 60;

taskTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

// Update progress bar
const progress = Math.min(100, (elapsed / plantState.taskDuration) * 100);
taskProgress.style.width = `${progress}%`;

// Enable complete button if 80% time passed
if (progress >= 80) {
completeTaskBtn.disabled = false;
}

// Auto-complete if time is up
if (remaining === 0 && plantState.currentTask) {
completeTask();
}
}

function completeTask() {
if (!plantState.currentTask) return;

// Calculate growth bonus based on task difficulty
const growthBonus = plantState.currentTask.difficulty * 2;

// Advance day
plantState.day += 1;
if (plantState.day > MAX_GROWTH_DAYS) plantState.day = MAX_GROWTH_DAYS;

// Add growth bonus
plantState.growth = Math.min(100, plantState.growth + growthBonus);

// Reset task
plantState.currentTask = null;
plantState.taskStartTime = null;
taskPanel.style.display = 'none';
completeTaskBtn.disabled = true;

// Update UI and save
updateUI();
savePlantState();

showNotification("Task Completed!", `Great job! Your plant ${plantState.name} has grown ${growthBonus}% faster thanks to your task.`);
}

function skipTask() {
if (!plantState.currentTask) return;

// Reset task
plantState.currentTask = null;
plantState.taskStartTime = null;
taskPanel.style.display = 'none';
completeTaskBtn.disabled = true;

savePlantState();

showNotification("Task Skipped", "That's okay. You can try a different task later.");
}

function checkWaterDecrease() {
// Calculate hours since last watered
const hoursSinceWatered = (new Date() - new Date(plantState.lastWatered)) / (1000 * 60 * 60);

// Decrease water by appropriate amount
const decrease = (hoursSinceWatered / 24) * WATER_DECREASE_RATE;
plantState.waterLevel = Math.max(0, plantState.waterLevel - decrease);

// Check withering
checkWithering();

// Update UI
updateUI();
savePlantState();
}

function updateWeather() {
const hour = new Date().getHours();

// Clear all weather
sun.style.display = 'none';
moon.style.display = 'none';
rain.style.display = 'none';
document.body.classList.remove('night-mode');

// Determine if it's night (7 PM - 7 AM)
if (hour < 7 || hour >= 19) {
document.body.classList.add('night-mode');
moon.style.display = 'block';
} else {
sun.style.display = 'block';
}

// Random chance of rain (20%)
if (Math.random() < 0.2) {
createRain();
rain.style.display = 'block';
document.body.style.backgroundImage = 'none';
document.body.style.backgroundColor = 'var(--rainy-bg)';
} else {
document.body.style.backgroundColor = hour < 7 || hour >= 19 ? 'var(--night-bg)' : 'var(--day-bg)';
}
}

function createRain() {
rain.innerHTML = '';

// Create raindrops
for (let i = 0; i < 100; i++) {
const raindrop = document.createElement('div');
raindrop.className = 'raindrop';

// Random position
raindrop.style.left = `${Math.random() * 100}%`;

// Random delay and duration
raindrop.style.animationDelay = `${Math.random() * 2}s`;
raindrop.style.animationDuration = `${0.5 + Math.random()}s`;

rain.appendChild(raindrop);
}
}

function updateUI() {
dayCounter.textContent = `Day ${plantState.day}`;
waterLevel.textContent = `${Math.round(plantState.waterLevel)}%`;
growthLevel.textContent = `${plantState.growth}%`;

// Update plant info text
if (plantState.withering) {
plantInfo.textContent = `${plantState.name} is getting thirsty! Water your plant soon.`;
} else if (plantState.waterLevel < 70) {
plantInfo.textContent = `${plantState.name} could use some water soon.`;
} else {
plantInfo.textContent = `${plantState.name} is healthy and growing well! Keep it up!`;
}

// Update plant visualization
updatePlantVisualization();
}

function showNotification(title, message) {
notificationTitle.textContent = title;
notificationText.textContent = message;
notificationModal.style.display = 'flex';
}

function savePlantState() {
// Convert Date objects to strings for storage
const stateToSave = { ...plantState };
stateToSave.lastVisit = new Date();

localStorage.setItem('plantFriend', JSON.stringify(stateToSave));
}
});
