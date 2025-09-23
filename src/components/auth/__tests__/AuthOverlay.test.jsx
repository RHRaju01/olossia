import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import { AuthOverlay } from "../AuthOverlay";

// Simple mock auth that returns field errors from register
const mockAuth = () => {
  return {
    register: async (data) => {
      return {
        success: false,
        errors: [
          { param: "email", msg: "Invalid email format" },
          { param: "password", msg: "Password too weak" },
        ],
      };
    },
    login: async () => ({ success: false }),
    error: null,
    errors: null,
    clearError: () => {},
  };
};

describe("AuthOverlay", () => {
  it("renders field errors returned from server and focuses first invalid field", async () => {
    const auth = mockAuth();
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <AuthOverlay isOpen={true} onClose={() => {}} authOverride={auth} />
      </MemoryRouter>
    );

    // Fill required fields to trigger register flow
    const firstName = screen.getByPlaceholderText(/First name/i);
    const lastName = screen.getByPlaceholderText(/Last name/i);
    const email = screen.getByPlaceholderText(/Enter your email/i);
    const password = screen.getByPlaceholderText(/Create a strong password/i);
    const confirm = screen.getByPlaceholderText(/Confirm your password/i);

    fireEvent.change(firstName, { target: { value: "Jane" } });
    fireEvent.change(lastName, { target: { value: "Doe" } });
    fireEvent.change(email, { target: { value: "not-an-email" } });
    // Use a strong password so the submit button is enabled in sign-up mode
    const strongPassword = "Str0ngPass!";
    fireEvent.change(password, { target: { value: strongPassword } });
    fireEvent.change(confirm, { target: { value: strongPassword } });

    // The submit button may be temporarily disabled while React updates password strength.
    // Submit the form directly to ensure the onSubmit handler runs in tests.
    const form = document.querySelector("form");
    fireEvent.submit(form);

    // Wait for the field error messages to appear
    const emailError = await screen.findByText(/Invalid email format/i);
    const passwordError = await screen.findByText(/Password too weak/i);

    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();

    // The first invalid field (email) should be focused
    expect(document.activeElement).toBe(email);
  });
});
