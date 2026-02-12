const video = document.getElementById('webcam');
const videoContainer = document.getElementById('video-container');
const aiStatus = document.getElementById('aiStatus');
const startAiAuthBtn = document.getElementById('startAiAuth');
const scanButton = document.getElementById('scanButton');
const scannerDisplay = document.getElementById('scannerDisplay');
const authInstruction = document.getElementById('authInstruction');

let isModelLoaded = false;
let isStreamActive = false;

// Load models from a stable public source for the hackathon demo
// Using vladmandic's repo which hosts the weights compatible with his fork
const MODEL_URL = 'https://vladmandic.github.io/face-api/model/';

async function loadModels() {
    if (isModelLoaded) return;
    
    console.log("Loading AI models...");
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        
        isModelLoaded = true;
        console.log("AI Models loaded successfully");
        // Update button state silently or just log
    } catch (e) {
        console.error("Failed to load AI models:", e);
        aiStatus.textContent = "AI Error: Could not load models. Check connection.";
        aiStatus.style.color = "var(--evm-red)";
    }
}

// Event Listeners
startAiAuthBtn.addEventListener('click', async () => {
    startAiAuthBtn.disabled = true;
    startAiAuthBtn.innerHTML = '<span class="status-spinner" style="width:20px;height:20px;border-width:2px;display:inline-block"></span> Loading AI...';
    
    if (!isModelLoaded) {
        await loadModels();
    }
    
    if (isModelLoaded) {
        startAiAuthBtn.classList.add('hidden');
        videoContainer.style.display = 'block';
        startVideo();
    } else {
        startAiAuthBtn.disabled = false;
        startAiAuthBtn.textContent = 'Retry AI Load';
    }
});

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => {
            video.srcObject = stream;
            isStreamActive = true;
        })
        .catch(err => {
            console.error("Camera error:", err);
            aiStatus.textContent = "Camera Error: " + err.message;
            aiStatus.style.color = "var(--evm-red)";
        });
}

video.addEventListener('play', () => {
    const canvas = document.getElementById('overlay');
    // Ensure display sizes are correct
    const displaySize = { width: video.clientWidth || 400, height: video.clientHeight || 300 };
    faceapi.matchDimensions(canvas, displaySize);
    
    aiStatus.textContent = "Align face in camera...";
    aiStatus.style.color = "var(--evm-green-light)";

    const interval = setInterval(async () => {
        if (!isStreamActive || video.paused || video.ended) {
            clearInterval(interval);
            return;
        }

        try {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
            
            // Resize detections to fit canvas
            const resizeDetections = faceapi.resizeResults(detections, displaySize);
            
            // Clear and draw
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizeDetections);
            // Optional: faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
            
            if (detections.length > 0) {
                // Check score of the best detection
                const bestScore = detections[0].detection.score;
                
                if (bestScore > 0.7) {
                    // Success!
                    clearInterval(interval);
                    aiStatus.textContent = "✅ Face Verified: " + Math.round(bestScore * 100) + "%";
                    aiStatus.style.color = "#22c55e";
                    
                    // Draw green box
                    const box = resizeDetections[0].detection.box;
                    const drawBox = new faceapi.draw.DrawBox(box, { label: 'Verified Student', boxColor: '#22c55e' });
                    drawBox.draw(canvas);

                    // Transition after delay
                    setTimeout(() => {
                        stopVideo();
                        showFingerprintStep();
                    }, 1500);
                }
            }
        } catch (err) {
            console.error("Detection loop error:", err);
        }
    }, 100);
});

function stopVideo() {
    isStreamActive = false;
    video.pause();
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    videoContainer.style.display = 'none';
}

function showFingerprintStep() {
    // Reveal the fingerprint / auth interface
    scannerDisplay.style.display = 'block';
    scanButton.classList.remove('hidden');
    authInstruction.textContent = "Face Verified. Place finger on sensor.";
    
    // Add success animation/class to instruction
    authInstruction.style.color = "#22c55e";
}

// Proactive load
loadModels();
