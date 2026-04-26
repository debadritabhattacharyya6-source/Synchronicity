import { useState } from "react";
import "./Settings.css";

export default function Settings({ theme, setTheme }) {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "How do I change theme?",
      a: "Use the toggle above to switch between light and dark mode."
    },
    {
      q: "Is my data saved?",
      a: "Yes, your preferences are stored locally."
    }
  ];

  return (
    <div className="settings-container">

      <h1 className="settings-title">Settings</h1>

      {/* THEME CARD */}
      <div className="settings-card">
        <div className="card-header">
          <h2>Appearance</h2>
          <span className="subtext">Customize your interface</span>
        </div>

        <div className="theme-row">
          <span>Dark Mode</span>

          <div
            className={`toggle ${theme === "light" ? "light" : ""}`}
            onClick={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          >
            <div className="toggle-circle"></div>
          </div>
        </div>
      </div>

      {/* FAQ CARD */}
      <div className="settings-card">
        <div className="card-header">
          <h2>FAQ</h2>
          <span className="subtext">Common questions</span>
        </div>

        {faqs.map((item, i) => (
          <div key={i} className="faq-item">
            <div
              className="faq-question"
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.q}
            </div>

            {open === i && (
              <div className="faq-answer">{item.a}</div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}