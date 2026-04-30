async function performCapture() {
    try {
        const response = await fetch("http://localhost:3000/api/vipps/capture-all");
        const data = await response.json();
        console.log("Capture Response:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error calling capture-all", err);
    }
}
performCapture();
