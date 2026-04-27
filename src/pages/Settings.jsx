import { useState } from "react";
import "./Settings.css";
import { Moon, HelpCircle } from "lucide-react";

export default function Settings({ theme, setTheme }) {

  const [open, setOpen] = useState(null);
  const [active, setActive] = useState("Appearance");

  const sections = ["Appearance", "FAQ"];

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
    <div className="settings-page">

      {/* HEADER */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <div className="settings-underline"></div>
      </div>

      <div className="settings-layout">

        {/* LEFT NAV */}
        <div className="settings-nav">
          {sections.map((sec) => (
            <div
              key={sec}
              className={`nav-item ${active === sec ? "active" : ""}`}
              onClick={() => setActive(sec)}
            >
              {sec}
            </div>
          ))}
        </div>

        {/* RIGHT CONTENT */}
        <div className="settings-content">

          {/* APPEARANCE */}
          {active === "Appearance" && (
            <div className="settings-card">
              <h2>Appearance</h2>
              <p className="subtext">Customize your interface</p>

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
          )}

          {/* FAQ */}
          {active === "FAQ" && (
            <div className="settings-card">
              <h2>FAQ</h2>
              <p className="subtext">Common questions</p>

              {faqs.map((item, i) => (
                <div
                  key={i}
                  className={`faq-item ${open === i ? "active" : ""}`}
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  <div className="faq-question">
                    {item.q}
                  </div>

                  {open === i && (
                    <div className="faq-answer">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
