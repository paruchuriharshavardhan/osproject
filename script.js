// Function to create input fields for processes
function createProcessInputs() {
    const processCount = document.getElementById('numProcesses').value;
    const processInputsDiv = document.getElementById('processInputs');
    processInputsDiv.innerHTML = ''; // Clear previous inputs

    for (let i = 0; i < processCount; i++) {
        processInputsDiv.innerHTML += `
            <div>
                <h3>Process ${i + 1}</h3>
                <label>Arrival Time:</label>
                <input type="number" id="arrivalTime${i}" required>
                <label>Burst Time:</label>
                <input type="number" id="burstTime${i}" required>
                <label>Priority (if applicable):</label>
                <input type="number" id="priority${i}">
            </div>
        `;
    }
}

// Function to run the selected scheduling algorithm
function runSchedulingAlgorithm() {
    const processCount = document.getElementById('numProcesses').value;
    const processes = [];

    for (let i = 0; i < processCount; i++) {
        const arrivalTime = parseInt(document.getElementById(`arrivalTime${i}`).value);
        const burstTime = parseInt(document.getElementById(`burstTime${i}`).value);
        const priority = parseInt(document.getElementById(`priority${i}`).value) || 0; // Default priority to 0
        processes.push({ id: i + 1, arrivalTime, burstTime, priority });
    }

    const selectedAlgorithm = document.getElementById('algorithm').value;
    let result;

    switch (selectedAlgorithm) {
        case 'FCFS':
            result = fcfs(processes);
            break;
        case 'SJF':
            result = sjf(processes);
            break;
        case 'SRTF':
            result = srtf(processes);
            break;
        case 'Priority':
            result = priorityScheduling(processes);
            break;
        case 'RoundRobin':
            const timeQuantum = parseInt(document.getElementById('timeQuantum').value) || 2; // Default time quantum
            result = roundRobin(processes, timeQuantum);
            break;
        default:
            alert('Please select a valid algorithm');
            return;
    }

    displayResults(result);
}

// FCFS Scheduling Algorithm Implementation
function fcfs(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let time = 0;
    let waitingTime = 0;
    let turnaroundTime = 0;
    const ganttChart = [];

    for (const process of processes) {
        const start = Math.max(time, process.arrivalTime);
        const end = start + process.burstTime;
        time = end;
        waitingTime += start - process.arrivalTime;
        turnaroundTime += end - process.arrivalTime;
        ganttChart.push({ id: process.id, start, end });
    }

    return { waitingTime: waitingTime / processes.length, turnaroundTime: turnaroundTime / processes.length, ganttChart };
}

// SJF Scheduling Algorithm Implementation
function sjf(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let time = 0;
    let waitingTime = 0;
    let turnaroundTime = 0;
    const ganttChart = [];
    const readyQueue = [];

    while (processes.length > 0 || readyQueue.length > 0) {
        while (processes.length > 0 && processes[0].arrivalTime <= time) {
            readyQueue.push(processes.shift());
        }

        if (readyQueue.length > 0) {
            readyQueue.sort((a, b) => a.burstTime - b.burstTime);
            const process = readyQueue.shift();
            const start = time;
            const end = start + process.burstTime;
            time = end;
            waitingTime += start - process.arrivalTime;
            turnaroundTime += end - process.arrivalTime;
            ganttChart.push({ id: process.id, start, end });
        } else {
            time++;
        }
    }

    return { waitingTime: waitingTime / ganttChart.length, turnaroundTime: turnaroundTime / ganttChart.length, ganttChart };
}

// SRTF Scheduling Algorithm Implementation
function srtf(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let time = 0;
    let waitingTime = 0;
    let turnaroundTime = 0;
    const ganttChart = [];
    const remainingBurstTimes = processes.map(p => ({ ...p, remaining: p.burstTime }));
    const readyQueue = [];

    while (remainingBurstTimes.length > 0) {
        for (const process of remainingBurstTimes) {
            if (process.arrivalTime <= time && process.remaining > 0) {
                readyQueue.push(process);
            }
        }

        if (readyQueue.length > 0) {
            readyQueue.sort((a, b) => a.remaining - b.remaining);
            const process = readyQueue[0];
            ganttChart.push({ id: process.id, start: time, end: time + 1 });
            process.remaining--;

            if (process.remaining === 0) {
                const endTime = time + 1;
                waitingTime += endTime - process.arrivalTime - process.burstTime;
                turnaroundTime += endTime - process.arrivalTime;
                remainingBurstTimes.splice(remainingBurstTimes.indexOf(process), 1);
            }
        } else {
            ganttChart.push({ id: null, start: time, end: time + 1 }); // Idle time
        }
        time++;
    }

    return { waitingTime: waitingTime / ganttChart.length, turnaroundTime: turnaroundTime / ganttChart.length, ganttChart };
}

// Priority Scheduling Algorithm Implementation
function priorityScheduling(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime || a.priority - b.priority);
    let time = 0;
    let waitingTime = 0;
    let turnaroundTime = 0;
    const ganttChart = [];

    for (const process of processes) {
        const start = Math.max(time, process.arrivalTime);
        const end = start + process.burstTime;
        time = end;
        waitingTime += start - process.arrivalTime;
        turnaroundTime += end - process.arrivalTime;
        ganttChart.push({ id: process.id, start, end });
    }

    return { waitingTime: waitingTime / processes.length, turnaroundTime: turnaroundTime / processes.length, ganttChart };
}

// Round Robin Scheduling Algorithm Implementation
function roundRobin(processes, timeQuantum) {
    const queue = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let time = 0;
    let waitingTime = 0;
    let turnaroundTime = 0;
    const ganttChart = [];

    while (queue.length > 0) {
        const process = queue.shift();
        const start = Math.max(time, process.arrivalTime);
        const execTime = Math.min(process.burstTime, timeQuantum);
        const end = start + execTime;
        ganttChart.push({ id: process.id, start, end });
        time = end;

        process.burstTime -= execTime;

        if (process.burstTime > 0) {
            queue.push(process); // Re-add process to the queue
        } else {
            waitingTime += start - process.arrivalTime;
            turnaroundTime += end - process.arrivalTime;
        }
    }

    return { waitingTime: waitingTime / ganttChart.length, turnaroundTime: turnaroundTime / ganttChart.length, ganttChart };
}

// Function to display results
function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <h2>Results</h2>
        <p>Average Waiting Time: ${result.waitingTime.toFixed(2)}</p>
        <p>Average Turnaround Time: ${result.turnaroundTime.toFixed(2)}</p>
        <h3>Gantt Chart</h3>
        <div class="gantt-chart">${generateGanttChart(result.ganttChart)}</div>
    `;
}

// Function to generate Gantt Chart HTML
function generateGanttChart(ganttChart) {
    let chartHtml = '';
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFF5']; // Add more colors if needed
    ganttChart.forEach((segment, index) => {
        const width = (segment.end - segment.start) * 20; // Increase scale for display
        const color = segment.id ? colors[(segment.id - 1) % colors.length] : 'lightgray'; // Idle time in light gray
        chartHtml += `<div class="gantt-segment" style="width: ${width}px; background-color: ${color}; border: 1px solid black; padding: 5px; margin: 2px;">
            <span class="gantt-time">(${segment.start} - ${segment.end})</span>
        </div>
        <div class="gantt-label">${segment.id ? 'P' + segment.id : 'Idle'}</div>`;
    });
    return chartHtml;
}

// Add CSS for Gantt chart
const style = document.createElement('style');
style.innerHTML = `
    .gantt-segment {
        display: inline-block;
        position: relative;
        text-align: center;
        color: white;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        height: 30px; /* Height of the Gantt segment */
        line-height: 30px; /* Center text vertically */
    }
    .gantt-label {
        display: inline-block;
        text-align: center;
        width: 100%;
        font-weight: bold;
        margin-top: -10px; /* Adjust as needed */
    }
    .gantt-time {
        display: block;
        font-size: 0.8em;
    }
`;
document.head.appendChild(style);

// Event listeners
document.getElementById('createInputsButton').addEventListener('click', createProcessInputs);
document.getElementById('runSimulationButton').addEventListener('click', runSchedulingAlgorithm);