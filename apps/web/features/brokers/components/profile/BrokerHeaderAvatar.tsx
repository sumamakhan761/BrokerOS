import React from "react";

interface BrokerHeaderAvatarProps {
  broker: any;
}

export function BrokerHeaderAvatar({ broker }: BrokerHeaderAvatarProps) {
  const initials = broker.name
    ? broker.name
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="relative shrink-0">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex items-center justify-center relative ${
          broker.profilePhotoUrl
            ? "bg-slate-100"
            : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20"
        } outline outline-1 -outline-offset-1 outline-black/10`}
      >
        {broker.profilePhotoUrl ? (
          <img
            src={broker.profilePhotoUrl}
            alt="Broker Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight select-none">
            {initials}
          </span>
        )}
      </div>
    </div>
  );
}
