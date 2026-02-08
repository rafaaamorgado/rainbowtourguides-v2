'use client';

import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  addToast
} from "@heroui/react";
import { MoreHorizontal, Copy, Eye, Ban } from "lucide-react";

interface UserProfile {
  id: string;
  email?: string;
  role?: string;
}

export function UserActions({ user }: { user: UserProfile }) {

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    addToast({
      title: "Copied",
      description: "User ID has been copied to clipboard.",
      color: "success",
    });
  };

  const handleAction = (action: string) => {
    addToast({
      title: "Action Triggered",
      description: `${action} for user ${user.id}`,
      color: "primary",
    });
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="light" isIconOnly size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User Actions">
        <DropdownItem
          key="copy"
          startContent={<Copy className="h-4 w-4" />}
          onPress={handleCopyId}
        >
          Copy ID
        </DropdownItem>
        <DropdownItem
          key="view"
          startContent={<Eye className="h-4 w-4" />}
          onPress={() => handleAction("View Details")}
        >
          View Details
        </DropdownItem>
        <DropdownItem
          key="suspend"
          className="text-danger"
          color="danger"
          startContent={<Ban className="h-4 w-4" />}
          onPress={() => handleAction("Suspend User")}
        >
          Suspend User
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
