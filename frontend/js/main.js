@"
document.addEventListener('DOMContentLoaded', function() {
    console.log('CAFYP application loaded');
    
    // Initialize Rasa WebChat
    window.addEventListener('load', function() {
        window.WebChat.default.init({
            selector: "#rasa-chat-widget",
            customData: {"language": "en"},
            socketUrl: "http://localhost:5005",
            socketPath: "/socket.io/",
            title: "CAFYP",
            subtitle: "Care Assistant For Your Pain",
            params: {"storage": "session"}
        });
    });
    
    // Initialize Chart.js visualization
    const ctx = document.getElementById('pain-chart').getContext('2d');
    
    // Sample data - would be replaced with actual data from Rasa/IBM Pain States
    const painData = {
        labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        datasets: [{
            label: 'Pain Level',
            data: [3, 5, 2, 6, 4, 3, 5],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1
        }]
    };
    
    const config = {
        type: 'line',
        data: painData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Weekly Pain Level Tracking'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 10,
                    title: {
                        display: true,
                        text: 'Pain Intensity (0-10)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day of Week'
                    }
                }
            }
        }
    };
    
    new Chart(ctx, config);
});
"@ | Out-File -FilePath "frontend\js\main.js" -Encoding utf8
