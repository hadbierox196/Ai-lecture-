function generateLecture() {
  const userInput = document.getElementById("user-input").value.trim();
  const lectureOutput = document.getElementById("lecture-output");

  if (!userInput) {
    lectureOutput.innerHTML = "<p>Please enter a valid prompt.</p>";
    return;
  }

  // Clear previous outputs and input field
  lectureOutput.innerHTML = "Generating lecture... Please wait.";
  document.getElementById("user-input").value = "";

  // AI Instruction for Formatting
  const aiInstruction = `
    Format the response with:
    - Bolded headings
    - Bullet points
    - Occasional spelling errors
    - Short paragraphs
    - Organized, concise ideas
    `;
  const prompt = `${aiInstruction} ${userInput}`;

  // Text API Call for Lecture Content
  const textApiUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
  fetch(textApiUrl)
    .then(response => response.text())
    .then(data => {
      const formattedLecture = formatLecture(data);
      lectureOutput.innerHTML = formattedLecture;
      generateMindMap(data);  // Generate the mind map after lecture output
    })
    .catch(error => {
      lectureOutput.innerHTML = "<p>Error generating lecture. Please try again.</p>";
      console.error("Text API Error:", error);
    });
}

// Formats the lecture into bullet points with headings
function formatLecture(text) {
  const paragraphs = text.split("\n");
  let formatted = "<h2>Generated Lecture</h2>";

  paragraphs.forEach(paragraph => {
    const headingRegex = /\*\*(.*?)\*\*/g;
    if (headingRegex.test(paragraph)) {
      const formattedParagraph = paragraph.replace(headingRegex, (_, boldText) => {
        return `<strong>${boldText}</strong>`; // Bold the text without shifting position
      });
      formatted += `<p>${formattedParagraph}</p>`;
    } else if (paragraph.startsWith("- ")) {
      formatted += `<ul><li>${paragraph.slice(2)}</li></ul>`;
    } else {
      formatted += `<p>${paragraph}</p>`;
    }
  });

  return formatted;
}

// Generate the mind map based on bolded text
function generateMindMap(lectureText) {
  const mindMapOutput = document.getElementById("flowchart-container");
  mindMapOutput.innerHTML = "Generating mind map... Please wait.";

  // Extract bolded headings as nodes
  const boldedHeadings = extractBoldHeadings(lectureText);
  
  if (boldedHeadings.length < 2) {
    mindMapOutput.innerHTML = "<p>Not enough bolded text found to create a mind map.</p>";
    return;
  }

  // Generate a simple hierarchical mind map based on bolded headings
  const mindMapData = createMindMapData(boldedHeadings);

  // Render the mind map using the generated data
  renderMindMap(mindMapData);
}

// Extracts bolded headings from the lecture text
function extractBoldHeadings(text) {
  const headingRegex = /\*\*(.*?)\*\*/g;
  const boldedHeadings = [];
  let match;

  while ((match = headingRegex.exec(text)) !== null) {
    boldedHeadings.push(match[1]);
  }

  return boldedHeadings;
}

// Creates mind map data based on bolded headings
function createMindMapData(headings) {
  const nodes = headings.map((heading, index) => {
    return { 
      id: index + 1, 
      text: heading, 
      x: 200 + (index % 4) * 350,  // Adjusted for more horizontal space
      y: 150 + Math.floor(index / 4) * 250,  // Increased vertical space
      width: 300,  // Larger width
      height: 80  // Larger height
    };
  });

  const links = [];
  for (let i = 1; i < nodes.length; i++) {
    links.push({ from: nodes[i - 1].id, to: nodes[i].id });
  }

  return { nodes, links };
}

// Render the mind map in the container using SVG
function renderMindMap(data) {
  const mindMapOutput = document.getElementById("flowchart-container");
  mindMapOutput.innerHTML = ""; // Clear previous mind map

  const svgNamespace = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  
  // Calculate viewBox based on number of nodes and spacing adjustments
  const width = data.nodes.length * 350;
  const height = Math.ceil(data.nodes.length / 4) * 250;  // Adjusted height to fit all nodes
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  mindMapOutput.appendChild(svg);

  // Draw connections between nodes
  data.links.forEach(link => {
    const fromNode = data.nodes.find(node => node.id === link.from);
    const toNode = data.nodes.find(node => node.id === link.to);

    const path = `M ${fromNode.x + fromNode.width / 2} ${fromNode.y + fromNode.height} C ${fromNode.x + 70} ${fromNode.y + 40}, ${toNode.x - 70} ${toNode.y - 40}, ${toNode.x + toNode.width / 2} ${toNode.y}`;

    const line = document.createElementNS(svgNamespace, "path");
    line.setAttribute("d", path);
    line.setAttribute("stroke", "black");
    line.setAttribute("stroke-width", "2");
    line.setAttribute("fill", "transparent");
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("stroke-linejoin", "round");
    svg.appendChild(line);
  });

  // Draw nodes as squares with more detail
  data.nodes.forEach(node => {
    const rect = document.createElementNS(svgNamespace, "rect");
    rect.setAttribute("x", node.x);
    rect.setAttribute("y", node.y);
    rect.setAttribute("width", node.width);
    rect.setAttribute("height", node.height);
    rect.setAttribute("stroke", "black");
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("fill", "#f0f8ff");  // Light blue background for squares
    rect.setAttribute("rx", "15");  // Rounded corners
    rect.setAttribute("ry", "15");  // Rounded corners
    svg.appendChild(rect);

    const text = document.createElementNS(svgNamespace, "text");
    text.setAttribute("x", node.x + node.width / 2);
    text.setAttribute("y", node.y + node.height / 2);
    text.setAttribute("fill", "black");
    text.setAttribute("font-size", "18");
    text.setAttribute("font-family", "Indie Flower");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("alignment-baseline", "middle");
    text.textContent = node.text;
    svg.appendChild(text);
  });
        }
