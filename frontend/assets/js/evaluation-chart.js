document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("evaluationChart");

    if (!canvas || typeof window.Chart === "undefined") {
        return;
    }

    new window.Chart(canvas, {
        type: "scatter",
        data: {
            datasets: [{
                label: "Giá thực tế vs Giá dự đoán (Triệu VNĐ)",
                data: [
                    { x: 800, y: 815 },
                    { x: 1220, y: 1210 },
                    { x: 1650, y: 1640 },
                    { x: 2400, y: 2425 },
                    { x: 3850, y: 3820 },
                    { x: 4600, y: 4590 },
                ],
                backgroundColor: "rgba(217, 119, 6, 0.9)",
                pointRadius: 6,
                pointHoverRadius: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: "Giá Thực Tế (Triệu VNĐ)", color: "#64748b" },
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: { color: "#64748b" },
                },
                y: {
                    title: { display: true, text: "Giá Dự Đoán (Triệu VNĐ)", color: "#64748b" },
                    grid: { color: "rgba(0, 0, 0, 0.05)" },
                    ticks: { color: "#64748b" },
                },
            },
            plugins: {
                legend: { labels: { color: "#1e293b" } },
            },
        },
    });
});
