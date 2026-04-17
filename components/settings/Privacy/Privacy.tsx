import React from "react";

const PrivacyContent = React.memo(() => (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
      Privacy Settings
    </h2>
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border">
        <div>
          <h3 className="text-gray-900 font-medium">Data Collection</h3>
          <p className="text-sm text-gray-600">
            Allow collection of usage analytics
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border">
        <div>
          <h3 className="text-gray-900 font-medium">Conversation History</h3>
          <p className="text-sm text-gray-600">Save conversation history</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" defaultChecked />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  </div>
));

export default PrivacyContent;
