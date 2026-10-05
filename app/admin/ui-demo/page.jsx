"use client";

import { useState } from "react";

import {
  Bell,
  Check,
  FileText,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

import Button from "@/app/Components/Admin/UI/Button";
import IconButton from "@/app/Components/Admin/UI/IconButton";
import Card from "@/app/Components/Admin/UI/Card";
import Input from "@/app/Components/Admin/UI/Input";
import Textarea from "@/app/Components/Admin/UI/Textarea";
import Select from "@/app/Components/Admin/UI/Select";
import SearchInput from "@/app/Components/Admin/UI/SearchInput";
import Badge from "@/app/Components/Admin/UI/Badge";
import Dropdown, {
  DropdownItem,
} from "@/app/Components/Admin/UI/Dropdown";
import Modal from "@/app/Components/Admin/UI/Modal";
import ConfirmDialog from "@/app/Components/Admin/UI/ConfirmDialog";
import PageHeader from "@/app/Components/Admin/UI/PageHeader";
import StatCard from "@/app/Components/Admin/UI/StatCard";
import EmptyState from "@/app/Components/Admin/UI/EmptyState";
import LoadingState from "@/app/Components/Admin/UI/LoadingState";
import Toggle from "@/app/Components/Admin/UI/Toggle";
import Toolbar from "@/app/Components/Admin/UI/Toolbar";
import Pagination from "@/app/Components/Admin/UI/Pagination";

export default function AdminUIDemo() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [page, setPage] = useState(1);

  return (
    <div className="min-h-screen bg-[#F7F9F9] p-4 sm:p-6 lg:p-8 dark:bg-[#0B1719]">
      <div className="mx-auto max-w-[1600px]">

        <PageHeader
          eyebrow="Admin Design System"
          title="Universal Admin UI"
          description="Reusable components designed for modern dashboards, CMS systems and business applications."
          action={
            <Button
              icon={<Plus size={16} />}
              onClick={() => setModal(true)}
            >
              Create Item
            </Button>
          }
        />

        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Users"
            value="12,480"
            change="+18.4%"
            description="vs. last month"
            icon={<Users size={18} />}
          />

          <StatCard
            title="Content"
            value="1,284"
            change="+8.2%"
            description="published items"
            icon={<FileText size={18} />}
          />

          <StatCard
            title="Notifications"
            value="384"
            change="+12.4%"
            description="this month"
            icon={<Bell size={18} />}
          />

          <StatCard
            title="System Health"
            value="98%"
            change="+2.1%"
            description="configuration health"
            icon={<Settings size={18} />}
          />

        </div>


        {/* FORMS + ACTIONS */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <Card
            title="Form Components"
            description="Reusable inputs for any admin form."
          >
            <div className="grid gap-5 sm:grid-cols-2">

              <Input
                label="Name"
                placeholder="Enter name"
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                icon={<Search size={16} />}
              />

              <Select
                label="Category"
                placeholder="Choose category"
                options={[
                  {
                    label: "Business",
                    value: "business",
                  },
                  {
                    label: "Technology",
                    value: "technology",
                  },
                  {
                    label: "Marketing",
                    value: "marketing",
                  },
                ]}
              />

              <Input
                label="Website"
                placeholder="https://example.com"
                hint="Use a complete website address."
              />

              <div className="sm:col-span-2">

                <Textarea
                  label="Description"
                  placeholder="Write a short description..."
                  rows={4}
                />

              </div>

              <div className="sm:col-span-2">

                <Toggle
                  label="Publish immediately"
                  description="Make this content visible immediately after saving."
                  checked={enabled}
                  onChange={setEnabled}
                />

              </div>

            </div>
          </Card>


          <Card
            title="Actions & Status"
            description="Buttons, badges, menus and destructive actions."
          >

            <div className="space-y-6">

              <div>

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Buttons
                </p>

                <div className="flex flex-wrap gap-2">

                  <Button>
                    Primary
                  </Button>

                  <Button variant="secondary">
                    Secondary
                  </Button>

                  <Button variant="soft">
                    Soft
                  </Button>

                  <Button variant="outline">
                    Outline
                  </Button>

                  <Button variant="ghost">
                    Ghost
                  </Button>

                  <Button variant="danger">
                    Delete
                  </Button>

                </div>

              </div>


              <div>

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <div className="flex flex-wrap gap-2">

                  <Badge status="published">
                    Published
                  </Badge>

                  <Badge status="draft">
                    Draft
                  </Badge>

                  <Badge status="pending">
                    Pending
                  </Badge>

                  <Badge status="failed">
                    Failed
                  </Badge>

                  <Badge variant="info">
                    Information
                  </Badge>

                  <Badge variant="neutral">
                    Archived
                  </Badge>

                </div>

              </div>


              <div>

                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Actions
                </p>

                <div className="flex flex-wrap items-center gap-2">

                  <IconButton
                    icon={<Settings size={16} />}
                    label="Settings"
                    variant="soft"
                  />

                  <IconButton
                    icon={<Trash2 size={16} />}
                    label="Delete"
                    variant="danger"
                  />

                  <Dropdown label="More actions">

                    <DropdownItem
                      icon={<Check size={15} />}
                    >
                      Mark as published
                    </DropdownItem>

                    <DropdownItem
                      icon={<Settings size={15} />}
                    >
                      Edit settings
                    </DropdownItem>

                    <DropdownItem
                      danger
                      icon={<Trash2 size={15} />}
                    >
                      Delete
                    </DropdownItem>

                  </Dropdown>

                </div>

              </div>


              <div className="border-t border-black/[0.06] pt-5 dark:border-white/[0.08]">

                <Button
                  onClick={() => setConfirm(true)}
                >
                  Test Confirmation
                </Button>

              </div>

            </div>

          </Card>

        </div>


        {/* TABLE */}

        <Card
          className="mt-6"
          title="Management Table"
          description="The foundation for future Services, Blog, Portfolio, Users and other modules."
        >

          <Toolbar
            search={
              <SearchInput
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search content..."
                className="w-full sm:max-w-sm"
              />
            }

            filters={
              <Select
                name="status"
                placeholder="All statuses"
                options={[
                  {
                    label: "Published",
                    value: "published",
                  },
                  {
                    label: "Draft",
                    value: "draft",
                  },
                  {
                    label: "Pending",
                    value: "pending",
                  },
                ]}
                className="sm:w-40"
              />
            }

            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                >
                  Export
                </Button>

                <Button
                  size="sm"
                  icon={<Plus size={14} />}
                >
                  Add New
                </Button>
              </>
            }
          />


          <div className="mt-5 overflow-x-auto">

            <table className="w-full min-w-[650px]">

              <thead>

                <tr className="border-b border-black/[0.06] text-left dark:border-white/[0.08]">

                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Name
                  </th>

                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Type
                  </th>

                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {[
                  [
                    "Business Strategy",
                    "Service",
                    "Published",
                  ],
                  [
                    "Digital Marketing",
                    "Service",
                    "Published",
                  ],
                  [
                    "Future of Business",
                    "Blog",
                    "Draft",
                  ],
                ].map(
                  ([name, type, status]) => (
                    <tr
                      key={name}
                      className="border-b border-black/[0.04] last:border-0 dark:border-white/[0.05]"
                    >

                      <td className="px-4 py-4 text-xs font-semibold text-[#0C1E21] dark:text-white">
                        {name}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-400">
                        {type}
                      </td>

                      <td className="px-4 py-4">

                        <Badge status={status}>
                          {status}
                        </Badge>

                      </td>

                      <td className="px-4 py-4 text-right">

                        <Dropdown
                          trigger={
                            <span className="text-xs font-semibold text-[#1E8A8A]">
                              Actions
                            </span>
                          }
                        >

                          <DropdownItem>
                            Edit
                          </DropdownItem>

                          <DropdownItem>
                            Duplicate
                          </DropdownItem>

                          <DropdownItem danger>
                            Delete
                          </DropdownItem>

                        </Dropdown>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>


          <Pagination
            page={page}
            totalPages={5}
            onPageChange={setPage}
          />

        </Card>


        {/* EMPTY + LOADING */}

        <div className="mt-6 grid gap-6 xl:grid-cols-2">

          <Card
            title="Empty State"
            description="Used whenever a module has no records."
          >

            <EmptyState
              icon={<FileText size={20} />}
              title="No content yet"
              description="Create your first piece of content to get started."
              action={
                <Button
                  size="sm"
                  icon={<Plus size={14} />}
                >
                  Create Content
                </Button>
              }
            />

          </Card>


          <Card
            title="Loading State"
            description="Reusable loading experience for tables and cards."
          >

            <LoadingState rows={4} />

          </Card>

        </div>

      </div>


      {/* CREATE MODAL */}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Create New Item"
        description="This modal can be reused for any admin form."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">

            <Button
              variant="secondary"
              onClick={() => setModal(false)}
            >
              Cancel
            </Button>

            <Button
              onClick={() => setModal(false)}
              icon={<Check size={15} />}
            >
              Save Item
            </Button>

          </div>
        }
      >

        <div className="grid gap-5">

          <Input
            label="Name"
            placeholder="Enter item name"
            required
          />

          <Select
            label="Type"
            placeholder="Select type"
            options={[
              {
                label: "Service",
                value: "service",
              },
              {
                label: "Blog",
                value: "blog",
              },
              {
                label: "Portfolio",
                value: "portfolio",
              },
            ]}
          />

          <Textarea
            label="Description"
            placeholder="Enter description..."
            rows={4}
          />

        </div>

      </Modal>


      {/* CONFIRMATION */}

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => setConfirm(false)}
        title="Delete this item?"
        description="This action will permanently remove the selected item."
        confirmText="Delete Item"
      />

    </div>
  );
}
