import { useEffect, useState } from "react";
import {
  CheckCircle,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";
import type {
  Tables,
  InsertTables,
  UpdateTables,
} from "../../../types/supabase";
import { getIcon, iconOptions } from "../../../utils/iconMap";

type Service = Tables<"services">;

type ServiceForm = {
  title: string;
  description: string;
  icon: string;
  is_published: boolean;
  order_index: string;
};

const emptyForm: ServiceForm = {
  title: "",
  description: "",
  icon: iconOptions[0]?.value ?? "",
  is_published: true,
  order_index: "0",
};

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const ManageServices = () => {
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingService, setEditingService] =
    useState<Service | null>(null);

  const [form, setForm] = useState<ServiceForm>(emptyForm);

  // =========================================================
  // Load Services
  // =========================================================

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("services")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setServices(data ?? []);
    } catch (err) {
      console.error("Failed to load services:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load services."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadServices();
  }, []);

  // =========================================================
  // Modal
  // =========================================================

  const openAddModal = () => {
    setEditingService(null);

    setForm({
      ...emptyForm,
      order_index: String(services.length),
    });

    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);

    setForm({
      title: service.title,
      description: service.description ?? "",
      icon: service.icon ?? iconOptions[0]?.value ?? "",
      is_published: service.is_published,
      order_index: String(service.order_index),
    });

    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingService(null);
    setForm(emptyForm);
  };

  // =========================================================
  // Form Helpers
  // =========================================================

  const updateForm = <K extends keyof ServiceForm>(
    field: K,
    value: ServiceForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // =========================================================
  // Create / Update
  // =========================================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Service title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Service description is required.");
      return;
    }

    const orderIndex = Number(form.order_index);

    if (!Number.isFinite(orderIndex) || orderIndex < 0) {
      setError("Order must be a valid number.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const title = form.title.trim();
      const description = form.description.trim();
      const slug = createSlug(title);

      if (!slug) {
        setError("Unable to generate a valid service slug.");
        return;
      }

      if (editingService) {
        const updateData: UpdateTables<"services"> = {
          title,
          slug,
          description,
          icon: form.icon || null,
          is_published: form.is_published,
          order_index: orderIndex,
        };

        const { error: updateError } = await supabase
          .from("services")
          .update(updateData)
          .eq("id", editingService.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const insertData: InsertTables<"services"> = {
          title,
          slug,
          description,
          icon: form.icon || null,
          is_published: form.is_published,
          order_index: orderIndex,
        };

        const { error: insertError } = await supabase
          .from("services")
          .insert(insertData);

        if (insertError) {
          throw insertError;
        }
      }

      closeModal();

      await loadServices();
    } catch (err) {
      console.error("Failed to save service:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save service."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Delete
  // =========================================================

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this service?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw deleteError;
      }

      setServices((current) =>
        current.filter((service) => service.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete service:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete service."
      );
    }
  };

  // =========================================================
  // Publish / Unpublish
  // =========================================================

  const togglePublished = async (service: Service) => {
    try {
      setError(null);

      const newPublishedState = !service.is_published;

      const { error: updateError } = await supabase
        .from("services")
        .update({
          is_published: newPublishedState,
        })
        .eq("id", service.id);

      if (updateError) {
        throw updateError;
      }

      setServices((current) =>
        current.map((item) =>
          item.id === service.id
            ? {
                ...item,
                is_published: newPublishedState,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update service status:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update service status."
      );
    }
  };

  // =========================================================
  // Loading
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
          <Loader2 size={24} className="animate-spin" />
          <span>Loading services...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Manage Services
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create, edit, publish and manage the services displayed
            on your website.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Service
        </button>
      </div>

      {/* Error */}
      {error && !isModalOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Services */}
      {services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Plus size={26} />
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
            No Services Found
          </h2>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Add your first service to display it on your website.
          </p>

          <button
            type="button"
            onClick={openAddModal}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Add First Service
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {services.map((service) => {
            const Icon = getIcon(service.icon);

            return (
              <div
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  {/* Information */}
                  <div className="flex min-w-0 flex-1 gap-5">
                    <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 sm:flex">
                      <Icon size={24} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            service.is_published
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {service.is_published ? "Published" : "Draft"}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          #{service.order_index + 1}
                        </span>
                      </div>

                      <h2 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                        {service.title}
                      </h2>

                      <p className="mt-3 max-w-3xl leading-7 text-slate-600 dark:text-slate-400">
                        {service.description}
                      </p>

                      <div className="mt-4">
                        <span className="text-xs font-medium text-slate-400">
                          Slug:
                        </span>
                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                          {service.slug}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void togglePublished(service)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      {service.is_published ? (
                        <>
                          <EyeOff size={17} />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye size={17} />
                          Publish
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(service)}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Pencil size={17} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void handleDelete(service.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={17} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {editingService ? "Edit Service" : "Add Service"}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {editingService
                    ? "Update the service information."
                    : "Create a new service for your website."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Error */}
            {error && (
              <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Title */}
              <div>
                <label
                  htmlFor="service-title"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Service Title
                </label>

                <input
                  id="service-title"
                  type="text"
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Website Development"
                  required
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="service-description"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Description
                </label>

                <textarea
                  id="service-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe your service..."
                  rows={5}
                  required
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Icon + Order */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="service-icon"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Icon
                  </label>

                  <select
                    id="service-icon"
                    value={form.icon}
                    onChange={(event) => updateForm("icon", event.target.value)}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {iconOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-slate-500">
                    This icon appears on the public services page.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="service-order"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Display Order
                  </label>

                  <input
                    id="service-order"
                    type="number"
                    min="0"
                    value={form.order_index}
                    onChange={(event) =>
                      updateForm("order_index", event.target.value)
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Lower numbers appear first.
                  </p>
                </div>
              </div>

              {/* Publish */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    updateForm("is_published", event.target.checked)
                  }
                  disabled={saving}
                  className="mt-1 h-5 w-5 accent-blue-600"
                />

                <div className="flex items-start gap-3">
                  <CheckCircle size={20} className="mt-0.5 text-green-500" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Publish Service
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Published services will be visible on the public website.
                    </p>
                  </div>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingService
                      ? "Update Service"
                      : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;