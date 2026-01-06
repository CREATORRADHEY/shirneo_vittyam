document.addEventListener('DOMContentLoaded', () => {
    // 1. File Upload Logic
    document.querySelectorAll('.upload-area').forEach(area => {
        const input = area.querySelector('input');
        const textSpan = area.querySelector('span:nth-child(2)');

        area.addEventListener('click', () => input.click());

        input.addEventListener('change', () => {
            if (input.files.length > 0) {
                textSpan.textContent = `Selected: ${input.files[0].name}`;
                area.style.borderColor = '#166534';
                area.style.background = '#dcfce7';
                area.querySelector('span:nth-child(1)').textContent = '✅';
                
                // Show Scan Button if it belongs to this area
                const scanBtn = area.parentElement.querySelector('.btn-scan');
                if (scanBtn) scanBtn.style.display = 'block';
            }
        });
    });

    // 1.5. OCR Logic
    const scanBtns = document.querySelectorAll('.btn-scan');
    const ocrResults = document.getElementById('ocr-results');
    const ocrName = document.getElementById('ocr-name');
    const ocrId = document.getElementById('ocr-id');
    const ocrIdLabel = document.getElementById('ocr-id-label');

    scanBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const target = btn.getAttribute('data-target');
            const area = document.getElementById(`area-${target}`);
            const input = area.querySelector('input');
            
            if (!input.files[0]) {
                alert(`Please select a ${target.toUpperCase()} card image first.`);
                return;
            }

            const originalText = btn.innerHTML;
            btn.innerHTML = 'AI Scanning... ⌛';
            btn.disabled = true;

            try {
                const formData = new FormData();
                formData.append('file', input.files[0]);

                console.log(`Sending ${target} for OCR scan...`);
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/ocr`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                console.log("OCR Result:", result);
                
                if (result.status === 'success') {
                    const info = result.extracted;
                    ocrName.textContent = info.name || "Unable to detect";
                    ocrId.textContent = info.id_number || "Unable to detect";
                    ocrIdLabel.textContent = info.doc_type === 'PAN' ? 'PAN Number' : 'Aadhaar Number';
                    
                    ocrResults.style.display = 'block';
                    ocrResults.scrollIntoView({ behavior: 'smooth' });
                } else {
                    alert("OCR Message: " + (result.message || "Could not read data from this image. Please try a clearer photo."));
                }
            } catch (err) {
                console.error("OCR Error:", err);
                alert("OCR Service is starting up (model loading). Please try again in 5 seconds.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    });

    // 2. Webcam & AI Logic
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const overlay = document.getElementById('overlay');
    const capturedImage = document.getElementById('captured-image');
    const startBtn = document.getElementById('start-btn');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const instruction = document.getElementById('liveness-instruction');
    let stream = null;
    let isModelLoaded = false;
    let livenessInterval = null;

    // Load AI Models
    async function loadModels() {
        try {
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
            await faceapi.nets.faceExpressionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
            isModelLoaded = true;
            console.log("AI Models Loaded");
        } catch (e) {
            console.error("Error loading models", e);
        }
    }

    // Initialize Models
    loadModels();

    async function startCamera() {
        if (!isModelLoaded) {
            alert("Please wait for AI models to load...");
            await loadModels();
        }

        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            video.srcObject = stream;
            
            // Wait for video to play
            video.onloadedmetadata = () => {
                video.play();
                startBtn.style.display = 'none';
                instruction.style.display = 'block';
                startLivenessCheck();
            };

        } catch (err) {
            console.error("Error accessing webcam:", err);
            alert("Could not access camera. Please allow permissions.");
        }
    }

    function startLivenessCheck() {
        // Setup overlay
        const displaySize = { width: video.videoWidth || 640, height: video.videoHeight || 480 };
        faceapi.matchDimensions(overlay, displaySize);

        livenessInterval = setInterval(async () => {
            if (video.paused || video.ended) return;

            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            // Clear previous drawings
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, overlay.width, overlay.height);

            // Check if we have a face
            if (resizedDetections.length > 0) {
                const detection = resizedDetections[0];
                const expressions = detection.expressions;

                // Liveness Logic: Check for Happiness (Smile)
                if (expressions.happy > 0.6) { // Lowered threshold slightly for better usability
                    instruction.textContent = "Great Smile! Capturing...";
                    instruction.style.background = "#166534"; // Green
                    
                    // Auto Capture after short delay
                    setTimeout(() => {
                        capturePhoto();
                        stopLivenessCheck();
                        instruction.style.display = 'none';
                    }, 500);
                } else {
                    instruction.textContent = "Please Smile 😊";
                    instruction.style.background = "rgba(0,0,0,0.7)";
                }
            } else {
                instruction.textContent = "Align Face in Center...";
            }

        }, 200);
    }

    function stopLivenessCheck() {
        if (livenessInterval) clearInterval(livenessInterval);
    }

    function capturePhoto() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        const dataURL = canvas.toDataURL('image/png');
        capturedImage.src = dataURL;
        capturedImage.style.display = 'block';
        video.style.display = 'none';
        overlay.style.display = 'none';
        
        captureBtn.style.display = 'none'; // Hidden mostly as we auto-capture
        retakeBtn.style.display = 'inline-block';
    }

    startBtn.addEventListener('click', startCamera);

    // Manual Capture (Fallback)
    captureBtn.addEventListener('click', () => {
        capturePhoto();
        stopLivenessCheck();
    });

    retakeBtn.addEventListener('click', () => {
        capturedImage.style.display = 'none';
        video.style.display = 'block';
        overlay.style.display = 'block';
        retakeBtn.style.display = 'none';
        
        // Restart flow
        instruction.style.display = 'block';
        instruction.textContent = "Please Smile 😊";
        instruction.style.background = "rgba(0,0,0,0.7)";
        startLivenessCheck();
    });

    // 3. Demo Mode Logic
    let isDemoMode = false;
    const demoBtn = document.getElementById('demo-mode-btn');
    
    // Function to run demo
    async function runDemo() {
        isDemoMode = true;
        if(demoBtn) {
            demoBtn.innerHTML = "⚡ Auto-Filling...";
            demoBtn.disabled = true;
        }

        // Step 1: Simulate Uploads
        const aadhaarArea = document.getElementById('area-aadhaar');
        const panArea = document.getElementById('area-pan');
        
        await new Promise(r => setTimeout(r, 100));
        if(aadhaarArea) {
            aadhaarArea.style.borderColor = '#166534';
            aadhaarArea.style.background = '#dcfce7';
            aadhaarArea.querySelector('.upload-text').textContent = "Selected: aadhaar_mock.pdf";
            aadhaarArea.querySelector('span:nth-child(1)').textContent = '✅';
        }

        await new Promise(r => setTimeout(r, 200));
        if(panArea) {
            panArea.style.borderColor = '#166534';
            panArea.style.background = '#dcfce7';
            panArea.querySelector('.upload-text').textContent = "Selected: pan_mock.jpg";
            panArea.querySelector('span:nth-child(1)').textContent = '✅';
        }

        // Step 2: SKIP CAMERA - Just show mocked success state
        await new Promise(r => setTimeout(r, 300));
        
        // Hide the start button, show mocked verification
        if(startBtn) startBtn.style.display = 'none';
        if(retakeBtn) {
            retakeBtn.textContent = 'Scanning...';
            retakeBtn.style.display = 'inline-block';
        }
        
        // Show instruction as verifying
        if(instruction) {
            instruction.style.display = 'block';
            instruction.textContent = "Verifying Liveness... 😊";
            instruction.style.background = "#166534";
        }

        // Step 3: Show success and REDIRECT after short delay
        await new Promise(r => setTimeout(r, 1000));
        
        if(instruction) instruction.textContent = "Face Verified ✅";
        if(retakeBtn) retakeBtn.textContent = 'Verified!';

        await new Promise(r => setTimeout(r, 500));

        // SUCCESS: Show alert and redirect directly
        alert(`✅ KYC APPROVED (DEMO MODE)\nTrust Score: 98/100\nMessage: AI Verified Person & Documents.`);
        
        // CLEAR GLOBAL FLAG ON SUCCESS
        localStorage.removeItem('demo_mode');
        
        // DIRECT REDIRECT (bypassing form submission)
        window.location.href = 'dashboard.html';
    }

    if (demoBtn) {
        demoBtn.addEventListener('click', runDemo);
    }

    // AUTO-RUN IF GLOBAL DEMO
    if (localStorage.getItem('demo_mode') === 'true') {
        setTimeout(() => {
            runDemo();
        }, 1000);
    }

    // Handle form submit
    document.getElementById('kyc-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const aadhaarInput = document.querySelectorAll('input[type="file"]')[0];
        const panInput = document.querySelectorAll('input[type="file"]')[1];

        // Bypass checks in Demo Mode
        if (!isDemoMode && (!aadhaarInput.files[0] || !panInput.files[0])) {
            alert("Please upload both documents.");
            return;
        }

        if (!isDemoMode && capturedImage.style.display === 'none') {
            alert("Please complete the liveness check (Smile at the camera).");
            return;
        }

        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Verifying with AI... 🤖';
        btn.disabled = true;

        // If Demo Mode, mock network request
        if (isDemoMode) {
            await new Promise(r => setTimeout(r, 2000)); // Fake network delay
            alert(`✅ KYC APPROVED (DEMO MODE)\nTrust Score: 98/100\nCIBIL Score: 780 (Excellent)\nMessage: AI Verified Person & Documents.`);
            
            // CLEAR GLOBAL FLAG ON SUCCESS
            localStorage.removeItem('demo_mode');
            
            window.location.href = 'dashboard.html'; 
            return;
        }

        // Real Mode
        try {
            const formData = new FormData();
            formData.append('aadhaar', aadhaarInput.files[0]);
            formData.append('pan', panInput.files[0]);
            
            const blob = await (await fetch(capturedImage.src)).blob();
            formData.append('live_photo', blob, 'live_photo.png');

            const response = await APP.secureFetch(`${CONFIG.API_BASE_URL}/api/kyc/submit`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            // ALWAYS Alert then Redirect for Prototype smoothness
            if (result.status === "Approved") {
                const cibilMsg = result.cibil_score ? `\nCIBIL Score: ${result.cibil_score} (Excellent)` : '';
                alert(`✅ KYC APPROVED!\nTrust Score: ${result.trust_score}/100${cibilMsg}\nMessage: ${result.message}`);
                window.location.href = 'dashboard.html'; // Changed redirect to dashboard as verified users go there
            } else {
                const cibilMsg = result.cibil_score ? `\nCIBIL Score: ${result.cibil_score}` : '';
                alert(`⚠️ KYC REVIEW NEEDED\nTrust Score: ${result.trust_score}/100${cibilMsg}\nReason: ${result.message}\n\n(Proceeding to Dashboard...)`);
                window.location.href = 'dashboard.html';
            }

        } catch (err) {
            console.error(err);
            alert("Server Error. Proceeding anyway.");
            window.location.href = 'index.html';
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
});
