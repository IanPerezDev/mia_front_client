import React, { useState } from "react";
import { MessageSquare, X, User, LucideIcon } from "lucide-react";
import { Barchart } from "../components/Chart";
import { ChartLine } from "../components/LineChart";

// Types and Interfaces
interface NavButton {
  id: number;
  label: string;
  icon?: LucideIcon;
}

interface GraphProps {
  children?: React.ReactNode;
}

// Navigation Component
const Navigation: React.FC<{
  buttons: NavButton[];
  selectedDashboard: number;
  onSelect: (id: number) => void;
}> = ({ buttons, selectedDashboard, onSelect }) => (
  <nav className="bg-white shadow-md p-4">
    <div className="flex flex-wrap gap-2">
      {buttons.map((button) => (
        <button
          key={button.id}
          onClick={() => onSelect(button.id)}
          className={`px-4 pl-2 flex gap-2 py-2  rounded-lg transition-colors ${
            selectedDashboard === button.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {button.icon ? <button.icon /> : <></>}
          {button.label}
        </button>
      ))}
    </div>
  </nav>
);

// Graph Components
const SingleGraph: React.FC<GraphProps> = ({ children }) => (
  <div className="bg-white rounded-md shadow-md min-h-fit">{children}</div>
);

const DoubleGraph: React.FC<GraphProps> = ({ children }) => (
  <div className="bg-white rounded-md shadow-md min-h-fit md:col-span-2 ">
    {children}
  </div>
);

const graphs = [
  {
    space: "single",
    component: "line",
  },
  {
    space: "double",
    component: "bar",
  },
  {
    space: "double",
    component: "line",
  },
  {
    space: "single",
    component: "bar",
  },
];

// Dashboard Grid Component
const DashboardGrid: React.FC = () => (
  <div className="flex-1 p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
      {graphs.map((graph) => {
        // Decidir cuál es el componente basado en la propiedad 'component'
        const ChildrenComponent =
          graph.component === "line" ? ChartLine : Barchart;

        // Renderizado condicional según el valor de 'space'
        return graph.space === "single" ? (
          <SingleGraph>
            <ChildrenComponent />
          </SingleGraph>
        ) : (
          <DoubleGraph>
            <ChildrenComponent />
          </DoubleGraph>
        );
      })}
    </div>
  </div>
);

// Chat Components
const ChatButton: React.FC<{
  isOpen: boolean;
  onClick: () => void;
}> = ({ isOpen, onClick }) => (
  <button
    onClick={onClick}
    className="fixed right-4 top-4 z-10 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
  >
    {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
  </button>
);

const ChatSidebar: React.FC<{
  isOpen: boolean;
}> = ({ isOpen }) => (
  <div
    className={`w-80 bg-white shadow-lg transform transition-transform duration-300 ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`}
    style={{ height: "100vh", position: "fixed", right: 0, top: 0 }}
  >
    <div className="p-4 h-full">
      <h2 className="text-xl font-semibold mb-4">Chat</h2>
      <div className="h-full flex items-center justify-center text-gray-500">
        Chat content will go here
      </div>
    </div>
  </div>
);

// Constants
const navButtons: NavButton[] = [
  { id: 1, label: "Viajeros", icon: User },
  { id: 2, label: "Reservas", icon: User },
  { id: 3, label: "Pagos", icon: User },
  { id: 4, label: "Gastos", icon: User },
];

// Main App Component
export function Dashboard() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState(1);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navigation
          buttons={navButtons}
          selectedDashboard={selectedDashboard}
          onSelect={setSelectedDashboard}
        />
        <DashboardGrid />
      </div>

      <ChatButton
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen(!isChatOpen)}
      />
      <ChatSidebar isOpen={isChatOpen} />
    </div>
  );
}
