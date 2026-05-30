import React, { useState, useEffect, useRef } from 'react';
import { Bot, Mic, MicOff, Send, X, Sliders, Volume2, VolumeX, Database, HelpCircle, Key } from 'lucide-react';
import { auth, db } from '../assets/firebase';
import { doc, getDoc, runTransaction, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import './HelpBot.css';



const GEMINI_API_KEY = import.meta.env.VITE_GCP_API_KEY;

export default function HelpBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I am SyncBot. Click the microphone to speak, or ask me directly about your deadlines!", sender: 'bot' }
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(GEMINI_API_KEY);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [statusText, setStatusText] = useState("Click microphone to speak.");

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  // Load API Key & settings from localStorage or import.meta.env
  useEffect(() => {
    const savedKey = (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE")
      ? GEMINI_API_KEY
      : localStorage.getItem('syncspace_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || "";
    setApiKey(savedKey);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      setStatusText("Voice not supported on this browser. Please type!");
      return;
    }
    let rec;
    try {
      rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
    } catch (e) {
      console.warn("Speech recognition initialization failed:", e);
      setStatusText("Voice not supported in this secure context. Please type!");
      return;
    }

    rec.onstart = () => {
      setIsListening(true);
      setStatusText("Listening...");
    };

    rec.onend = () => {
      setIsListening(false);
      setStatusText("Click microphone to speak.");
    };

    rec.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setStatusText("Microphone permission denied.");
      } else {
        setStatusText("Speech error. Try again.");
      }
      setIsListening(false);
    };

    rec.onresult = async (event) => {
      const resultIndex = event.resultIndex;
      const transcript = event.results[resultIndex][0].transcript.trim();
      console.log("Transcribed speech:", transcript);

      if (transcript.length > 1) {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: transcript,
          sender: 'user'
        }]);

        // Process the transcribed query with Gemini
        await processQuery(transcript);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Synthesize Text to Voice (TTS)
  const speakText = (text) => {
    if (!speechEnabled || !synthRef.current) return;

    // Cancel any ongoing speaking
    synthRef.current.cancel();

    // Clean up text from markdown links or brackets before speaking
    const cleanText = text.replace(/\[.*?\]/g, "").replace(/\*+/g, "").trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Try to pick a natural-sounding English voice
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Toggle Voice Listening Manual Override
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const fetchWorkspacesList = async () => {
    if (!auth.currentUser) return [];
    try {
      const q = query(
        collection(db, "groups"),
        where("memberIds", "array-contains", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const loadedGroups = [];
      querySnapshot.forEach((doc) => {
        loadedGroups.push(doc.data());
      });
      return loadedGroups;
    } catch (e) {
      console.error("Error fetching workspaces context:", e);
    }
    return [];
  };

  const fetchWorkspaceTasks = async () => {
    if (!auth.currentUser) return {};
    try {
      const activeWorkspaces = await fetchWorkspacesList();
      const loadedTasks = {};
      for (const group of activeWorkspaces) {
        const taskSnap = await getDoc(doc(db, "tasks", group.code));
        if (taskSnap.exists()) {
          loadedTasks[group.code] = taskSnap.data();
        }
      }
      return loadedTasks;
    } catch (e) {
      console.error("Error fetching workspace tasks context:", e);
    }
    return {};
  };

  const createWorkspaceDirectly = async (title, membersCount, deadlineString) => {
    if (!auth.currentUser) return false;
    try {
      // Generate random 4-digit code
      const randomCode = `SYNC-${Math.floor(1000 + Math.random() * 9000)}`;

      const newWorkspaceItem = {
        title: title || "New Team",
        maxMembers: Number(membersCount) || 5,
        deadline: deadlineString || "No Deadline",
        progress: 0,
        code: randomCode,
        ownerId: auth.currentUser.uid,
        memberIds: [auth.currentUser.uid]
      };

      const emptyTasks = {
        todo: [],
        inprogress: [],
        review: [],
        completed: []
      };

      // Write to root 'groups' and 'tasks' collections
      await setDoc(doc(db, "groups", randomCode), newWorkspaceItem);
      await setDoc(doc(db, "tasks", randomCode), emptyTasks);

      // Dispatch event to force other pages to refresh
      window.dispatchEvent(new Event('collaborationsUpdated'));
      return true;
    } catch (err) {
      console.error("Error creating workspace via Voice Assistant:", err);
      return false;
    }
  };

  // Fetch Current User's Deadlines from Firestore
  const fetchDeadlinesList = async () => {
    if (!auth.currentUser) return [];
    try {
      const docSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (docSnap.exists()) {
        return docSnap.data().deadlines || [];
      }
    } catch (e) {
      console.error("Error fetching deadlines context:", e);
    }
    return [];
  };

  // Run database update for Adding a Deadline
  const addDeadlineDirectly = async (deadlineDetails) => {
    if (!auth.currentUser) return false;
    const userDoc = doc(db, "users", auth.currentUser.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const docRef = await transaction.get(userDoc);
        if (!docRef.exists()) throw "User document not found";

        const existingDeadlines = docRef.data().deadlines || [];
        const nextId = existingDeadlines.length > 0
          ? Math.max(...existingDeadlines.map(o => o.id || 0)) + 1
          : 1;

        // Calculate Urgency Category based on date difference
        const today = new Date();
        const targetDate = new Date(deadlineDetails.dueDate);
        targetDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));

        let urgency = 'low';
        if (diffDays <= 7) urgency = 'high';
        else if (diffDays <= 14) urgency = 'medium';

        const newDeadlineItem = {
          id: nextId,
          title: deadlineDetails.title || "Untitled Task",
          course: deadlineDetails.course || "General",
          type: (deadlineDetails.type || "assignment").toLowerCase(),
          dueDate: deadlineDetails.dueDate || today.toLocaleDateString('en-CA'),
          time: deadlineDetails.time || "23:59",
          urgency: urgency,
          progress: 0
        };

        const updatedArray = [...existingDeadlines, newDeadlineItem];
        transaction.update(userDoc, { deadlines: updatedArray });
      });

      // Dispatch global custom event to force target pages (Deadlines/Calendar) to automatically reload list
      window.dispatchEvent(new Event('deadlineUpdated'));
      return true;
    } catch (err) {
      console.error("Firestore Transaction Error Add:", err);
      return false;
    }
  };

  const checkOffCheckpointDirectly = async (deadlineQuery, checkpointQuery) => {
    if (!auth.currentUser) return { success: false };
    const userDoc = doc(db, "users", auth.currentUser.uid);
    try {
      let responseMessage = "";
      await runTransaction(db, async (transaction) => {
        const docRef = await transaction.get(userDoc);
        if (!docRef.exists()) throw "User document not found";

        const existingDeadlines = docRef.data().deadlines || [];
        const dQuery = deadlineQuery.toLowerCase().trim();
        const cQuery = checkpointQuery.toLowerCase().trim();

        // 1. Find the parent deadline
        const deadlineIndex = existingDeadlines.findIndex(d =>
          d.title.toLowerCase().includes(dQuery) || dQuery.includes(d.title.toLowerCase())
        );
        if (deadlineIndex === -1) throw "Deadline not found";

        const deadline = existingDeadlines[deadlineIndex];
        const checkpoints = deadline.checkpoints || [];

        if (checkpoints.length === 0) throw "This deadline has no checkpoints to check off";

        // 2. Find the checkpoint
        const checkpointIndex = checkpoints.findIndex(c =>
          c.title.toLowerCase().includes(cQuery) || cQuery.includes(c.title.toLowerCase())
        );
        if (checkpointIndex === -1) throw "Checkpoint not found";

        // 3. Mark completed & calculate new progress percentage
        checkpoints[checkpointIndex].completed = true;
        const completedCount = checkpoints.filter(c => c.completed).length;
        const newProgress = Math.round((completedCount / checkpoints.length) * 100);

        // 4. Update the parent object
        existingDeadlines[deadlineIndex] = {
          ...deadline,
          checkpoints: checkpoints,
          progress: newProgress // Automatically scales up the progress bar!
        };

        transaction.update(userDoc, { deadlines: existingDeadlines });
        responseMessage = `Checked off "${checkpoints[checkpointIndex].title}" for your "${deadline.title}". Progress is now at ${newProgress}%.`;
      });

      // Fire event to refresh the UI instantly
      window.dispatchEvent(new Event('deadlineUpdated'));
      return { success: true, message: responseMessage };
    } catch (err) {
      console.error("Error updating checkpoint:", err);
      return { success: false, error: err };
    }
  };


  // Run database update for Deleting a Deadline
  const deleteDeadlineDirectly = async (titleQuery) => {
    if (!auth.currentUser) return { success: false, title: "" };
    const userDoc = doc(db, "users", auth.currentUser.uid);
    try {
      let deletedTitle = "";
      await runTransaction(db, async (transaction) => {
        const docRef = await transaction.get(userDoc);
        if (!docRef.exists()) throw "User document not found";

        const existingDeadlines = docRef.data().deadlines || [];
        const queryClean = titleQuery.toLowerCase().trim();

        // Find matching deadline by closest substring match
        const matched = existingDeadlines.find(d =>
          d.title.toLowerCase().includes(queryClean) ||
          queryClean.includes(d.title.toLowerCase())
        );

        if (!matched) throw "No matching deadline found";

        deletedTitle = matched.title;
        const filteredList = existingDeadlines.filter(d => d.id !== matched.id);
        transaction.update(userDoc, { deadlines: filteredList });
      });

      // Dispatch event to force other pages to refresh
      window.dispatchEvent(new Event('deadlineUpdated'));
      return { success: true, title: deletedTitle };
    } catch (err) {
      console.error("Firestore Transaction Error Delete:", err);
      return { success: false, error: err };
    }
  };

  // Send query to Gemini API
  const processQuery = async (queryText) => {
    if (!apiKey) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Please click on the gear icon ⚙️ at the top right of this chat and enter your Gemini API Key first to enable the assistant!",
        sender: 'bot'
      }]);
      speakText("Please set your Gemini API key in settings.");
      return;
    }

    setIsThinking(true);

    try {
      const activeDeadlines = await fetchDeadlinesList();
      const activeWorkspaces = await fetchWorkspacesList();

      // Calculate real-time analytics dynamically
      const totalDeadlines = activeDeadlines.length;
      const completedDeadlines = activeDeadlines.filter(d => d.progress === 100).length;
      const highPriority = activeDeadlines.filter(d => d.urgency === 'high').length;
      const averageProgress = totalDeadlines > 0
        ? Math.round(activeDeadlines.reduce((sum, d) => sum + (d.progress || 0), 0) / totalDeadlines)
        : 0;

      const courseDistribution = {};
      activeDeadlines.forEach(d => {
        const c = d.course || "General";
        courseDistribution[c] = (courseDistribution[c] || 0) + 1;
      });

      const calculatedAnalytics = {
        totalDeadlines,
        completedDeadlines,
        pendingDeadlines: totalDeadlines - completedDeadlines,
        highPriority,
        averageProgress,
        courseDistribution
      };

      const todayString = new Date().toLocaleDateString('en-CA');
      const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' });

      // Instruct Gemini to interpret voice instructions and return formatted JSON
      const systemInstructions = `
You are SyncBot, the intelligent floating voice assistant for the Synchronicity application.
Your target is to answer academic doubts, reply to deadline-related questions, parse voice instructions to add/delete deadlines, handle task checkpoints, and manage collaboration workspaces.

Today's Date: ${todayString} (${dayOfWeek})

User's Computed Real-Time Analytics:
${JSON.stringify(calculatedAnalytics, null, 2)}

User's Existing Deadlines List:
${JSON.stringify(activeDeadlines, null, 2)}

User's Active Collaboration Workspaces:
${JSON.stringify(activeWorkspaces, null, 2)}

You must classify the user's request into one of these intents:
1. "ADD_DEADLINE": Use this if the user wants to schedule/add a new task, assignment, exam, or project.
2. "DELETE_DEADLINE": Use this if the user wants to remove or delete a task/deadline.
3. "QUERY_DEADLINES": Use this if the user is asking questions about what deadlines they have, when something is due, how many tasks are pending, or their workload analytics metrics.
4. "ACADEMIC_DOUBT": Use this if the user asks any educational/conceptual doubt (e.g., explaining physics laws, math topics, coding bugs).
5. "GENERAL_CONVERSATION": Simple greetings or general small talk.
6. "CHECK_CHECKPOINT": Use this if the user wants to check off/complete a specific subtask or checkpoint of an existing deadline.
7. "CREATE_WORKSPACE": Use this if the user wants to create a new team, study group, or collaboration workspace.

You MUST respond strictly in valid JSON format matching this schema:
{
  "intent": "ADD_DEADLINE" | "DELETE_DEADLINE" | "QUERY_DEADLINES" | "ACADEMIC_DOUBT" | "GENERAL_CONVERSATION" | "CHECK_CHECKPOINT" | "CREATE_WORKSPACE",
  "response_text": "A brief, natural spoken response confirming the action or answering their query.",
  "extracted_data": {
    // Only required for ADD_DEADLINE:
    "title": "Clean concise title of the assignment or exam",
    "course": "Name of the academic course (e.g. Physics, Math, CS101) - default to 'General' if unknown",
    "type": "assignment" | "project" | "exam",
    "dueDate": "YYYY-MM-DD format. If the user said relative terms (e.g. 'next Friday', 'tomorrow', 'in 3 days'), calculate the absolute date based on ${todayString}",
    "time": "HH:MM format in 24hr format - default to '23:59' if not specified",

    // Required for CHECK_CHECKPOINT:
    "deadline_title_query": "Name or subject keyword of the target deadline(e.g. 'Chemistry Assignment')",
    "checkpoint_title_query": "Name or keyword of the specific subtask/checkpoint to check off(e.g. 'Read chapter 5')",

    // Only required for DELETE_DEADLINE:
    "title_query": "The name or subject keyword of the deadline to delete (e.g. 'Math Assignment')",

    // Only required for CREATE_WORKSPACE:
    "workspace_title": "Clean readable name for the new team / workspace",
    "members_count": "Number of members in the team - default to 1 if not mentioned",
    "workspace_deadline": "Due date or project deadline details (e.g., 'June 15' or 'No Deadline')"
  }
}

Important: Ensure "response_text" is natural, concise, and friendly as it will be read aloud. Keep academic explanations clear and engaging.
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstructions}\n\nUser Query: "${queryText}"` }]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: Status ${response.status}`);
      }

      const rawData = await response.json();
      const rawText = rawData.candidates[0].content.parts[0].text;
      const parsedResult = JSON.parse(rawText);

      console.log("Parsed Gemini Output:", parsedResult);

      const intent = parsedResult.intent;
      let finalSpeechText = parsedResult.response_text;

      // Handle Actions on Firestore based on Intents
      if (intent === "ADD_DEADLINE" && parsedResult.extracted_data) {
        const details = parsedResult.extracted_data;
        const addSuccess = await addDeadlineDirectly(details);
        if (addSuccess) {
          finalSpeechText = `I have successfully scheduled your ${details.type}: "${details.title}" for ${details.dueDate}.`;
        } else {
          finalSpeechText = "Sorry, I ran into a database error trying to add that deadline.";
        }
      }
      else if (intent === "DELETE_DEADLINE" && parsedResult.extracted_data?.title_query) {
        const query = parsedResult.extracted_data.title_query;
        const delResult = await deleteDeadlineDirectly(query);
        if (delResult.success) {
          finalSpeechText = `Deleted the deadline: "${delResult.title}".`;
        } else {
          finalSpeechText = `I couldn't find a deadline matching "${query}" in your list.`;
        }
      }
      else if (intent === "CHECK_CHECKPOINT" && parsedResult.extracted_data) {
        const data = parsedResult.extracted_data;
        const result = await checkOffCheckpointDirectly(data.deadline_title_query, data.checkpoint_title_query);
        if (result.success) {
          finalSpeechText = result.message;
        } else {
          finalSpeechText = `I couldn't complete that action. ${result.error || ""}`;
        }
      }
      else if (intent === "CREATE_WORKSPACE" && parsedResult.extracted_data) {
        const data = parsedResult.extracted_data;
        const createSuccess = await createWorkspaceDirectly(
          data.workspace_title,
          data.members_count,
          data.workspace_deadline
        );
        if (createSuccess) {
          finalSpeechText = `I have successfully created your team workspace "${data.workspace_title}" with ${data.members_count || 1} members.`;
        } else {
          finalSpeechText = "Sorry, I ran into a database error trying to create that team workspace.";
        }
      }

      // Render response in Chat bubble and read out loud
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: finalSpeechText,
        sender: 'bot'
      }]);
      speakText(finalSpeechText);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I experienced an error analyzing that. Please ensure your Gemini Key is correct and try again.",
        sender: 'bot'
      }]);
      speakText("Sorry, I could not complete your request due to an error.");
    } finally {
      setIsThinking(false);
    }
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const query = inputText;
    setMessages(prev => [...prev, { id: Date.now(), text: query, sender: 'user' }]);
    setInputText("");
    await processQuery(query);
  };

  const saveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('syncspace_gemini_key', apiKey);
    setShowSettings(false);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `Settings updated successfully!`,
      sender: 'system'
    }]);
    speakText("Settings saved successfully.");
  };

  return (
    <div className="helpbot-wrapper">
      {/* FLOATING CIRCLE TOGGLE BUTTON */}
      {!isOpen && (
        <button
          className={`helpbot-trigger ${isListening ? 'listening-pulse' : ''}`}
          onClick={() => setIsOpen(true)}
          title="Open Sync Assistant"
        >
          <div className="trigger-pulse-ring"></div>
          <Bot size={28} className="trigger-icon" />
          {isListening && <span className="listening-dot"></span>}
        </button>
      )}

      {/*  EXPANDED WIDGET */}
      {isOpen && (
        <div className="helpbot-container glass-panel">
          {/* Header */}
          <div className="helpbot-header">
            <div className="header-info">
              <Bot size={20} className="header-icon-avatar" />
              <div>
                <h3>SyncBot</h3>
                <span className="status-label">
                  {isThinking ? "Thinking..." : isSpeaking ? "Speaking..." : statusText}
                </span>
              </div>
            </div>

            <div className="header-controls">
              <button
                className={`control-btn ${speechEnabled ? 'active' : ''}`}
                onClick={() => {
                  setSpeechEnabled(!speechEnabled);
                  if (speechEnabled && synthRef.current) synthRef.current.cancel();
                }}
                title={speechEnabled ? "Mute Speech" : "Enable Speech"}
              >
                {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button
                className="control-btn"
                onClick={() => setShowSettings(!showSettings)}
                title="Settings"
              >
                <Sliders size={16} />
              </button>

              <button
                className="control-btn close-btn"
                onClick={() => {
                  setIsOpen(false);
                  setShowSettings(false);
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Settings Screen Panel Overlay */}
          {showSettings ? (
            <form onSubmit={saveSettings} className="helpbot-settings-panel">
              <h4>Assistant Settings</h4>

              {(!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE") && (
                <div className="setting-field">
                  <label><Key size={14} /> Gemini API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste AIzaSy... API key"
                  />
                  <small>Required to parse voice actions and academic answers.</small>
                </div>
              )}

              {/* Wake Word setting field removed for standard click-to-talk speech recognition */}

              <div className="settings-actions">
                <button type="submit" className="save-settings-btn">Save Configurations</button>
                <button type="button" className="cancel-settings-btn" onClick={() => setShowSettings(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {/* Message List */}
              <div className="helpbot-messages-container">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-row ${msg.sender}-msg`}>
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="message-row bot-msg">
                    <div className="message-bubble thinking-bubble">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Glowing Audio Waves Visualizer */}
              {isListening && !isThinking && (
                <div className="audio-wave-container">
                  <span className={`wave-bar b1 ${isSpeaking ? 'talking' : 'monitoring'}`}></span>
                  <span className={`wave-bar b2 ${isSpeaking ? 'talking' : 'monitoring'}`}></span>
                  <span className={`wave-bar b3 ${isSpeaking ? 'talking' : 'monitoring'}`}></span>
                  <span className={`wave-bar b4 ${isSpeaking ? 'talking' : 'monitoring'}`}></span>
                  <span className={`wave-bar b5 ${isSpeaking ? 'talking' : 'monitoring'}`}></span>
                </div>
              )}

              {/* Chat Input / Speech Toggles Footer */}
              <form onSubmit={handleSendText} className="helpbot-input-bar">
                <button
                  type="button"
                  className={`mic-toggle-btn ${isListening ? 'active-mic' : ''}`}
                  onClick={toggleListening}
                  title={isListening ? "Turn Microphone Off" : "Turn Microphone On"}
                >
                  {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask doubts or type task..."
                  disabled={isThinking}
                />

                <button type="submit" className="send-msg-btn" disabled={!inputText.trim() || isThinking}>
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}

