document.getElementById('saveBtn').addEventListener('click', () => {
  const apiKey = document.getElementById('apiKey').value;
  const resumeContent = document.getElementById('resumeContent').value;

  chrome.storage.local.set({
    apiKey: apiKey,
    resumeContent: resumeContent
  }, () => {
    const status = document.getElementById('status');
    status.textContent = 'Saved!';
    setTimeout(() => {
      status.textContent = '';
    }, 2000);
  });
});

document.getElementById('testBtn').addEventListener('click', async () => {
    const apiKey = document.getElementById('apiKey').value;
    const output = document.getElementById('debugOutput');
    output.style.display = 'block';
    output.textContent = 'Checking available models...';
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        
        if (data.error) {
            output.textContent = `ERROR: ${data.error.message}\n\nCode: ${data.error.status}\nDetails: ${JSON.stringify(data.error.details, null, 2)}`;
            output.style.color = 'red';
        } else {
            const models = data.models ? data.models.map(m => m.name).join('\n') : 'No models found';
            output.textContent = `SUCCESS! Your key works.\n\nAvailable Models:\n${models}`;
            output.style.color = 'green';
        }
    } catch(e) {
        output.textContent = `Network Error: ${e.message}`;
        output.style.color = 'red';
    }
});

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['apiKey', 'resumeContent'], (items) => {
    if (items.apiKey) {
      document.getElementById('apiKey').value = items.apiKey;
    }
    
    // Default Hardcoded Resume provided by user
    const defaultResume = String.raw`\documentclass[letterpaper,11pt]{article}

\usepackage{ragged2e}
\usepackage{latexsym}
\usepackage[margin=0.3in]{geometry}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{fontawesome5}
\usepackage{multicol}
\setlength{\multicolsep}{0pt}
\setlength{\columnsep}{10pt}
\input{glyphtounicode}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

\urlstyle{same}
\raggedbottom
\justifying

\setlength{\tabcolsep}{0in}

\titleformat{\section}{\scshape\raggedright\large}{}{0em}{}[\titlerule]


\pdfgentounicode=1

\newcommand{\resumeItem}[1]{\item \small\justifying #1}

\newcommand{\resumeSubheading}[4]{\vspace{-2pt}\item\begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}\textbf{#1} & #2 \\ \textit{\small#3} & \textit{\small #4} \\ \end{tabular*}\vspace{-17pt}}
\newcommand{\resumeProjectHeading}[2]{\item\begin{tabular*}{0.97\textwidth}{p{0.75\textwidth}@{\extracolsep{\fill}}r}\small#1 & #2 \\ \end{tabular*}\vspace{-7pt}}
\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.10in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

\begin{document}

\begin{center}
    \textbf{\huge \scshape Rohan Mukka} \\ \vspace{2pt}
    \small 
    \faPhone\ +1 (405) 501-5699 $|$ 
    \href{mailto:rohanmukka07@gmail.com}{\faEnvelope\ rohanmukka07@gmail.com} $|$ 
    \href{https://www.linkedin.com/in/rohanmukka/}{\faLinkedin\ linkedin.com/in/rohanmukka} $|$ 
    \href{https://www.github.com/rohanmukka}{\faGithub\ github.com/rohanmukka} \\[1pt] % tighter instead of [4pt]
    \href{https://portfolio-rohan03.vercel.app/}{\faGlobe\ portfolio-rohan03.vercel.app}
\end{center}

\vspace{-18pt} % reduces extra gap before summary
\section*{Summary}

Software Engineer and Computer Science graduate student with hands-on experience in full-stack development, AI/ML, and blockchain-based systems. Improved project efficiency by 30\% through automation and delivered scalable solutions with Python, Java, and JavaScript. Skilled in cloud platforms, CI/CD workflows, and agile development practices. Holds a Bachelor's in Computer Science and currently pursuing a Master's degree with a 4.0 GPA. 
\vspace{-5pt}

\section{Education}
\resumeSubHeadingListStart
    \resumeSubheading
    {University of Oklahoma}{Oklahoma, United States}
    {Master of Science in Computer Science | GPA: 4.0/4.0}{Aug 2024 -- May 2026}
    \vspace{15pt}
    \resumeSubheading
    {CVR College of Engineering}{Hyderabad, India}
    {Bachelor of Technology in Computer Science and Engineering (Minor in AI/ML) | GPA: 9.1/10.0}{Aug 2020 -- May 2024}
\resumeSubHeadingListEnd
\vspace{-2pt}
\section{Experience}
\resumeSubHeadingListStart
    \resumeSubheading
    {ML Engineer Intern}{July 2024 -- Aug 2024}
    {Internpe}{Remote}


    \resumeItemListStart
\vspace{7pt}

        \resumeItem{Developed and fine-tuned machine learning models for predictive analytics using \textbf{Python, TensorFlow, and Scikit-learn}, improving prediction accuracy by 20\%.}
        \resumeItem{Optimized data preprocessing and feature engineering, reducing model training time by 15\%.}
        \resumeItem{Collaborated with a cross-functional team to implement and deploy AI/ML solutions, increasing overall project efficiency by 10\%.}
    \resumeItemListEnd
\resumeSubHeadingListEnd
\vspace{-22pt}
\section{Projects}
\resumeSubHeadingListStart

  \resumeProjectHeading
{\textbf{BEneFIT: A Decentralized Fitness Accountability Framework} \href{https://github.com/kushi-3/BEneFIT}{\underline{GitHub}} $|$ \href{https://drive.google.com/file/d/1Q9owTK-uGbansKn5WoXiDxKAsk3fv_6N/view?usp=sharing}{\underline{Demo Video}}}{Apr 2025}
\resumeItemListStart
    \resumeItem{Developed \textbf{ETH}-staking models: Lock-and-Release (solo) and Redistribution (group), boosting goal completion by 35\%.}\vspace{-3pt}
    \resumeItem{Implemented smart contracts with React frontend and OAuth-secured backend.}\vspace{-3pt}
    \resumeItem{Outperformed Sweatcoin and StepN in decentralization, fairness, and flexibility, driving 30\% higher user engagement.}
\resumeItemListEnd


    \resumeProjectHeading
    {\textbf{Internship Program Management System} $|$ \emph{React.js, Node.js, MongoDB} $|$ \href{https://github.com/IPMS-Project/IPMS}{\underline{GitHub}}}{Jan 2025}
    \resumeItemListStart
       \resumeItem{Built internship modules (A.1–A.3) for requests, tracking, and evaluations, boosting submission efficiency by 30\%.}\vspace{-3pt}
       \resumeItem{Automated Supervisor and Coordinator approvals with reminders, cutting manual follow-ups by 50\%.}\vspace{-3pt}
       \resumeItem{Enhanced compliance with OU CS requirements through outcome mapping and dashboards, improving accuracy by 40\%.}
    \resumeItemListEnd

    \resumeProjectHeading
    {\textbf{A Robust Diagnostic System} $|$ \emph{Python, Prot\'eg\'e, SWRL}}{Mar 2024}
    \resumeItemListStart
        \resumeItem{Designed a diagnostic system integrating rule-based inference and machine learning, achieving a 25\% increase in accuracy.}\vspace{-3pt}
        \resumeItem{Implemented \textbf{SWRL rules} and ontology for structuring medical knowledge and identifying symptom patterns.}\vspace{-3pt}
        \resumeItem{Enhanced diagnostic accuracy by analyzing patient data with machine learning when rule-based methods were inconclusive.}
    \resumeItemListEnd
\resumeSubHeadingListEnd
\vspace{-15pt}
\section{Technical Skills}
\begin{itemize}[leftmargin=0.15in, label={}]
    \small{\item{
    \textbf{Languages}{: Python, Java, C/C++, JavaScript, SQL, Kotlin, HTML/CSS, Jquery, Typescript, MATLAB} \\
    \textbf{Developer Tools}{: GitHub, Gitlab, Kubernetes, Docker, AWS, Pycharm, Oracle database, Eclipse, Jenkins} \\
    \textbf{Frameworks/Tools}{: React.js, Node.js, Firebase, Bootstrap5, Google Cloud, TensorFlow, Scikit-learn, Angular, Django, Next.js} \\
    \textbf{Platforms}{: Linux/Unix, Windows, Git, Microsoft Office Suite}\\
    \textbf{Concepts}{:RESTful APIs, Fullstack Web Development, Machine learning, MVC, Software Development, Web Application Development, Mobile Application Development, Distributed Systems, Parallel Systems, Natural Language
Processing, Security Software Development, Accessible Technologies, Machine Learning Infrastructure, Speech Audio, Generative AI,
Reinforcement Learning}

    }}


\end{itemize}


\section{Extracurricular Activities}
\vspace{-5pt}

\begin{itemize}[leftmargin=0.15in, label={}, itemsep=0pt]
    \item \small{\item \small{Participated in and organized multiple hackathons, and contributed to IEEE workshops and AI/ML projects, gaining hands-on experience in innovation, leadership, and collaborative problem-solving.}
}
    \item \small{Solved over 400 Data Structures and Algorithms problems across different platforms.}
    \item \small{Mentored 50+ students in web development and problem-solving at GDSC Bootcamp, enhancing peer learning and project quality.}
    
\end{itemize}


\end{document}`;

    if (items.resumeContent) {
      document.getElementById('resumeContent').value = items.resumeContent;
    } else {
      document.getElementById('resumeContent').value = defaultResume;
    }
  });
});
