import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to submit initial user review (lazy import to prevent circular dependency with store)
export const submitFeedback = createAsyncThunk(
  "feedback/submitFeedback",
  async (payload, { rejectWithValue }) => {
    try {
      const { feedbackApi } = await import("./feedback.api");
      const response = await feedbackApi.submitReview(payload);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to submit review";
      return rejectWithValue(message);
    }
  }
);

// Async thunk to update contact details on a submitted review (lazy import to prevent circular dependency)
export const updateFeedbackContact = createAsyncThunk(
  "feedback/updateFeedbackContact",
  async ({ reviewId, contactDetails }, { rejectWithValue }) => {
    try {
      const { feedbackApi } = await import("./feedback.api");
      const response = await feedbackApi.updateReviewContact(reviewId, contactDetails);
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update contact details";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  rating: 0,
  selectedReasons: [],
  description: "",
  lang: "en", // "en" | "hi" | "mr"
  locationId: null,
  companyId: null,

  // Submission tracking
  isSubmitting: false,
  isUpdatingContact: false,
  showSuccessModal: false,
  submittedReviewId: null,
  tokenNumber: null,
  reviewData: null,
  error: null,
  successMessage: null,
};

export const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    setRating: (state, action) => {
      state.rating = action.payload;
    },
    setSelectedReasons: (state, action) => {
      state.selectedReasons = action.payload;
    },
    toggleReason: (state, action) => {
      const reasonId = action.payload;
      if (state.selectedReasons.includes(reasonId)) {
        state.selectedReasons = state.selectedReasons.filter((id) => id !== reasonId);
      } else {
        // Remove "0" (No Issues) if another issue is selected
        state.selectedReasons = [
          ...state.selectedReasons.filter((id) => id !== 0),
          reasonId,
        ];
      }
    },
    toggleNoIssues: (state) => {
      if (state.selectedReasons.includes(0)) {
        state.selectedReasons = [];
      } else {
        state.selectedReasons = [0];
      }
    },
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setLang: (state, action) => {
      state.lang = action.payload;
    },
    setLocationId: (state, action) => {
      state.locationId = action.payload;
    },
    setCompanyId: (state, action) => {
      state.companyId = action.payload;
    },
    setShowSuccessModal: (state, action) => {
      state.showSuccessModal = action.payload;
    },
    setSubmittedReviewId: (state, action) => {
      state.submittedReviewId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: (state) => {
      state.rating = 0;
      state.selectedReasons = [];
      state.description = "";
      state.error = null;
      state.successMessage = null;
    },
    resetAll: () => initialState,
  },
  extraReducers: (builder) => {
    // submitFeedback
    builder
      .addCase(submitFeedback.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.showSuccessModal = true;
        state.submittedReviewId =
          action.payload.reviewId || action.payload.data?.id || null;
        state.tokenNumber = action.payload.tokenNumber || null;
        state.successMessage =
          action.payload.message || "Review submitted successfully!";
        state.reviewData = {
          rating: state.rating,
          selectedReasons: state.selectedReasons,
          description: state.description,
        };
        // Reset form inputs after successful submit
        state.rating = 0;
        state.selectedReasons = [];
        state.description = "";
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload || "Failed to submit review";
      });

    // updateFeedbackContact
    builder
      .addCase(updateFeedbackContact.pending, (state) => {
        state.isUpdatingContact = true;
        state.error = null;
      })
      .addCase(updateFeedbackContact.fulfilled, (state, action) => {
        state.isUpdatingContact = false;
        state.successMessage =
          action.payload.message || "Contact details updated successfully!";
      })
      .addCase(updateFeedbackContact.rejected, (state, action) => {
        state.isUpdatingContact = false;
        state.error = action.payload || "Failed to update contact details";
      });
  },
});

export const {
  setRating,
  setSelectedReasons,
  toggleReason,
  toggleNoIssues,
  setDescription,
  setLang,
  setLocationId,
  setCompanyId,
  setShowSuccessModal,
  setSubmittedReviewId,
  clearError,
  resetForm,
  resetAll,
} = feedbackSlice.actions;

export default feedbackSlice.reducer;
