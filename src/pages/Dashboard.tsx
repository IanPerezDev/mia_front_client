import React, { useState } from "react";
import {
  MessageSquare,
  X,
  User,
  LucideIcon,
  Building,
  CreditCard,
  BarChart,
} from "lucide-react";
import { Barchart } from "../components/Chart";
import { ChartLine } from "../components/LineChart";
import { Link } from "wouter";

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
      <Link href="/">
        {" "}
        <svg
          className="h-8 w-auto"
          viewBox="0 0 1152 539"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g>
            <path
              className="fill-blue-600"
              d="M209.06,500.55s-.04.03-.06.02c-64.5-64.5-133.27-131.46-133.27-209.51,0-86.62,84.17-157.09,187.63-157.09s187.63,70.47,187.63,157.09c0,74.79-63.42,139.58-150.8,154.08-.02,0-.05-.01-.05-.04l-8.8-53.12c61.28-10.16,105.76-52.6,105.76-100.92,0-56.91-60-103.2-133.74-103.2s-133.74,46.3-133.74,103.2c0,49.8,48,93.56,111.66,101.79,0,0,.01,0,.01.02l-32.23,107.69Z"
            />
            <ellipse
              className="fill-gray-800"
              cx="215.01"
              cy="277.85"
              rx="28.37"
              ry="37.7"
            />
            <ellipse
              className="fill-gray-800"
              cx="317.34"
              cy="277.85"
              rx="28.37"
              ry="37.7"
            />
            <path
              className="fill-blue-600"
              d="M344.98,125.54c-2.9,0-5.84-.69-8.58-2.14-70.29-37.27-135.91-1.73-138.67-.2-8.84,4.91-20.01,1.76-24.95-7.07-4.94-8.82-1.84-19.96,6.96-24.93,3.45-1.95,85.44-47.12,173.85-.23,8.95,4.75,12.36,15.86,7.62,24.81-3.29,6.21-9.65,9.76-16.23,9.76Z"
            />
          </g>
        </svg>
      </Link>
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
  { id: 0, label: "Dashboard", icon: BarChart },
  { id: 1, label: "Viajeros", icon: User },
  { id: 2, label: "Reservas", icon: Building },
  { id: 3, label: "Pagos", icon: CreditCard },
  { id: 4, label: "Gastos", icon: CreditCard },
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

      {/* <ChatButton
        isOpen={isChatOpen}
        onClick={() => setIsChatOpen(!isChatOpen)}
      />
      <ChatSidebar isOpen={isChatOpen} /> */}
    </div>
  );
}
