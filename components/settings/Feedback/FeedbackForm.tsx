"use client";

import {
  Star,
  StarIcon,
  MessageCircle,
  ThumbsUp,
  Users,
  Target,
  Zap,
  Lightbulb,
  Rocket,
  Sparkles,
  PartyPopper,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import Button from "@/components/global-components/Button";
import ProgressBar from "@/components/progress-bar/ProgressBar";
import { RATING_EMOJIS, STAR_RATINGS } from "@/constants/constants";
import { useCreateAnswers } from "@/hooks/useCreateAnswers";
import { useListQuestions } from "@/hooks/useListQuestions";
import logger from "@/utils/logger/browserLogger";

type FeedbackStep = "initial" | "conditional" | "extended" | "thank-you";

interface Answer {
  questionId: string;
  answer: string | number;
}

const FeedbackForm: React.FC = () => {
  const [step, setStep] = useState<FeedbackStep>("initial");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submittedAnswers, setSubmittedAnswers] = useState<Answer[]>([]);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    successfulAnswers: string[];
  } | null>(null);

  const {
    data: questions,
    isLoading: questionsLoading,
    error: questionsError,
  } = useListQuestions();

  const {
    submitAnswers,
    isLoading: submittingAnswers,
    error: submitError,
  } = useCreateAnswers();

  const organizedQuestions = useMemo(() => {
    const starRating = questions.find((q) => q.questionType === "STAR_RATING");
    const conditionalTrigger = questions.find(
      (q) => q.questionType === "CONDITIONAL_TRIGGER"
    );
    const singleChoiceQuestions = questions.filter(
      (q) => q.questionType === "SINGLE_CHOICE"
    );
    const textAreaQuestion = questions.find(
      (q) => q.questionType === "TEXT_AREA"
    );

    return {
      starRating,
      conditionalTrigger,
      singleChoiceQuestions,
      textAreaQuestion,
    };
  }, [questions]);

  const formId = questions.length > 0 ? questions[0].formId : undefined;

  const getAnswer = (questionId: string) => {
    return answers.find((a) => a.questionId === questionId)?.answer;
  };

  const getDisplayAnswer = (questionId: string) => {
    const currentAnswer = answers.find(
      (a) => a.questionId === questionId
    )?.answer;
    if (currentAnswer !== undefined) return currentAnswer;

    const submittedAnswer = submittedAnswers.find(
      (a) => a.questionId === questionId
    )?.answer;
    return submittedAnswer;
  };

  const setAnswer = (questionId: string, answer: string | number) => {
    setAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { questionId, answer };
        return newAnswers;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const handleStarClick = (starIndex: number) => {
    if (organizedQuestions.starRating) {
      const currentRating = getAnswer(
        organizedQuestions.starRating.questionId
      ) as number;

      if (currentRating === starIndex) {
        setAnswer(organizedQuestions.starRating.questionId, starIndex - 1);
      } else {
        setAnswer(organizedQuestions.starRating.questionId, starIndex);
      }
    }
  };

  const handleInitialSubmit = async () => {
    if (isInitialFormValid() && organizedQuestions.textAreaQuestion) {
      try {
        const currentAnswers = answers.filter(
          (answer) =>
            answer.questionId ===
            organizedQuestions.textAreaQuestion?.questionId
        );

        await submitAnswers({
          answers: currentAnswers,
          formId: formId,
        });

        setSubmittedAnswers((prev) => [...prev, ...currentAnswers]);
        setAnswers((prev) =>
          prev.filter(
            (answer) =>
              answer.questionId !==
              organizedQuestions.textAreaQuestion?.questionId
          )
        );

        setStep("conditional");
      } catch (error) {
        logger.info("Failed to submit initial answer:", error);
      }
    }
  };

  const handleWantsToHelp = (wants: boolean) => {
    if (organizedQuestions.conditionalTrigger) {
      const answerText = wants ? "Yes, let's do this!" : "Nah, I'm good";
      setAnswer(organizedQuestions.conditionalTrigger.questionId, answerText);

      if (wants) {
        setStep("extended");
      } else {
        setAnswers((prev) =>
          prev.filter(
            (answer) =>
              !organizedQuestions.singleChoiceQuestions.some(
                (q) => q.questionId === answer.questionId
              ) &&
              answer.questionId !== organizedQuestions.starRating?.questionId
          )
        );
      }
    }
  };

  const handleSingleChoiceAnswer = (questionId: string, answer: string) => {
    setAnswer(questionId, answer);
  };

  const handleTextAreaAnswer = (questionId: string, answer: string) => {
    setAnswer(questionId, answer);
  };

  const handleSubmit = async () => {
    try {
      const result = await submitAnswers({
        answers: answers,
        formId: formId,
      });

      setSubmissionResult(result);
      setStep("thank-you");
    } catch (error) {
      logger.info("Failed to submit answers:", error);
    }
  };

  const getRatingText = (rating: number) => {
    if (
      organizedQuestions.starRating?.options &&
      organizedQuestions.starRating.options[rating - 1]
    ) {
      return organizedQuestions.starRating.options[rating - 1];
    }

    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Amazing";
      default:
        return "";
    }
  };

  const getRatingEmoji = (rating: number) => {
    switch (rating) {
      case 1:
        return RATING_EMOJIS.POOR;
      case 2:
        return RATING_EMOJIS.FAIR;
      case 3:
        return RATING_EMOJIS.GOOD;
      case 4:
        return RATING_EMOJIS.VERY_GOOD;
      case 5:
        return RATING_EMOJIS.AMAZING;
      default:
        return "";
    }
  };

  const isExtendedFormValid = () => {
    const starRatingValid =
      getAnswer(organizedQuestions.starRating?.questionId || "") !== undefined;
    const singleChoiceValid = organizedQuestions.singleChoiceQuestions.every(
      (q) => getAnswer(q.questionId) !== undefined
    );
    return starRatingValid && singleChoiceValid;
  };

  const isInitialFormValid = () => {
    const answer = getAnswer(
      organizedQuestions.textAreaQuestion?.questionId || ""
    );
    return (
      answer !== undefined && answer !== null && String(answer).trim() !== ""
    );
  };

  const isFinalSubmitValid = () => {
    if (wantsToHelp === "Yes, let's do this!") {
      return isExtendedFormValid();
    }
    return true;
  };

  const resetForm = () => {
    setStep("initial");
    setAnswers([]);
    setSubmittedAnswers([]);
    setSubmissionResult(null);
  };

  const starRating =
    (getAnswer(organizedQuestions.starRating?.questionId || "") as number) || 0;
  const wantsToHelp = getAnswer(
    organizedQuestions.conditionalTrigger?.questionId || ""
  );

  if (questionsLoading) {
    return (
      <div className="h-full w-full bg-white">
        <ProgressBar isLoading={true} />
      </div>
    );
  }

  if (questionsError) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-xs md:max-w-sm lg:max-w-sm xl:max-w-md mx-auto">
          <div className="w-12 h-12 md:w-14 md:h-14 lg:w-14 lg:h-14 xl:w-16 xl:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-3 lg:mb-3 xl:mb-4">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-red-500" />
          </div>
          <h1 className="text-lg md:text-lg lg:text-lg xl:text-xl font-semibold text-gray-900 mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2">
            Failed to Load Questions
          </h1>
          <p className="text-gray-600 text-xs md:text-xs lg:text-xs xl:text-sm mb-3 md:mb-3 lg:mb-3 xl:mb-4">
            We couldn't load the feedback form. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="px-5 md:px-5 lg:px-5 xl:px-6 py-2 md:py-1.5 lg:py-1.5 xl:py-2 bg-blue-500 text-white rounded-md md:rounded-md lg:rounded-md xl:rounded-lg hover:bg-blue-600 text-xs md:text-xs lg:text-xs xl:text-sm"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (step === "thank-you") {
    return (
      <div className="min-h-[calc(100vh-44px)] md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4 md:p-3 lg:p-3 xl:p-4">
        <div className="text-center max-w-xs md:max-w-sm lg:max-w-sm xl:max-w-md mx-auto">
          <div className="w-16 h-16 md:w-16 md:h-16 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mx-auto mb-5 md:mb-6 lg:mb-6 xl:mb-8 flex items-center justify-center">
            {submissionResult?.success ? (
              <CheckCircle className="w-8 h-8 md:w-8 md:h-8 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" />
            ) : (
              <AlertCircle className="w-8 h-8 md:w-8 md:h-8 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" />
            )}
          </div>

          <h1 className="text-2xl md:text-2xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3 md:mb-3 lg:mb-3 xl:mb-4 flex items-center justify-center gap-1.5">
            {submissionResult?.success ? "Awesome! Thank You!" : "Thank You!"}{" "}
            <PartyPopper className="w-6 h-6 md:w-6 md:h-6 lg:w-6 lg:h-6 xl:w-8 xl:h-8" />
          </h1>

          <p className="text-gray-600 text-sm md:text-base lg:text-base xl:text-lg mb-3 md:mb-3 lg:mb-3 xl:mb-4 leading-relaxed">
            Your insights help us make our service even better for everyone. We
            really appreciate you taking the time!
          </p>

          <Button
            onClick={resetForm}
            className="px-6 md:px-6 lg:px-6 xl:px-8 py-3 md:py-3 lg:py-3 xl:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl inline-flex items-center text-xs md:text-xs lg:text-xs xl:text-sm"
          >
            <Sparkles className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2" />
            Rate Another Experience
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-44px)] md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-56px)] p-4 md:p-5 lg:p-6 xl:p-8 bg-white flex items-start overflow-x-hidden  relative">
      {/* Background gradient blobs */}
      <div
        className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(142, 94, 255, 0.35)",
          filter: "blur(180px)",
          transform: "translate(100px, -80px)",
        }}
      />
      <div
        className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
        style={{
          background: "rgba(255, 133, 94, 0.2)",
          filter: "blur(180px)",
          transform: "translate(-100px, -80px)",
        }}
      />

      <div className="relative w-full flex flex-col justify-between items-start gap-4 md:gap-4 lg:gap-4 xl:gap-6 overflow-hidden z-10">
        <div className="w-full">
          <div className="flex items-center mb-4 md:mb-4 lg:mb-4 xl:mb-6">
            <h1 className="text-xl md:text-xl lg:text-xl xl:text-2xl font-semibold text-gray-900">
              How was your experience?
            </h1>
          </div>

          <p className="text-gray-600 text-xs md:text-xs lg:text-xs xl:text-sm mb-5 md:mb-6 lg:mb-6 xl:mb-8">
            Help us understand what worked well and what didn't
          </p>

          {organizedQuestions.textAreaQuestion &&
            !(step === "extended" && wantsToHelp === "Yes, let's do this!") && (
              <div className="bg-pink-50 rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl p-4 md:p-4 lg:p-4 xl:p-6 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                <div className="flex items-center mb-3 md:mb-3 lg:mb-3 xl:mb-4">
                  <Lightbulb className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2 text-pink-600" />
                  <h2 className="text-sm md:text-base lg:text-base xl:text-lg font-medium text-gray-800">
                    {organizedQuestions.textAreaQuestion.questionText}
                  </h2>
                </div>

                <textarea
                  value={
                    (getDisplayAnswer(
                      organizedQuestions.textAreaQuestion.questionId
                    ) as string) || ""
                  }
                  onChange={(e) => {
                    const questionId =
                      organizedQuestions.textAreaQuestion?.questionId;
                    if (questionId) {
                      handleTextAreaAnswer(questionId, e.target.value);
                    }
                  }}
                  rows={4}
                  disabled={submittingAnswers || step !== "initial"}
                  className="w-full p-3 md:p-3 lg:p-3 xl:p-4 text-xs md:text-xs lg:text-xs xl:text-sm resize-none border border-gray-200 rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl bg-white disabled:opacity-50"
                  placeholder="Share your thoughts and suggestions..."
                  maxLength={500}
                />
                {organizedQuestions.textAreaQuestion.furtherSuggestions && (
                  <p className="text-xs md:text-xs lg:text-xs xl:text-sm text-gray-500 mt-1.5 md:mt-1.5 lg:mt-1.5 xl:mt-2 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 mr-1 md:mr-0.5 lg:mr-0.5 xl:mr-1" />
                    {organizedQuestions.textAreaQuestion.furtherSuggestions}
                  </p>
                )}
              </div>
            )}

          {/* Conditional Trigger */}
          {(step === "conditional" ||
            (step === "extended" && wantsToHelp !== "Yes, let's do this!")) &&
            organizedQuestions.conditionalTrigger && (
              <div className="bg-green-50 rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl p-4 md:p-4 lg:p-4 xl:p-6 mb-5 md:mb-6 lg:mb-6 xl:mb-8">
                <div className="flex items-center mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                  <Users className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2 text-green-600" />
                  <h2 className="text-sm md:text-base lg:text-base xl:text-lg font-medium text-gray-800">
                    {organizedQuestions.conditionalTrigger.questionText}
                  </h2>
                </div>

                <div className="flex flex-col gap-2.5 md:gap-3 lg:gap-3 xl:gap-4">
                  {organizedQuestions.conditionalTrigger.options?.map(
                    (option, index) => (
                      <button
                        key={option}
                        onClick={() => handleWantsToHelp(index === 0)}
                        disabled={submittingAnswers}
                        className={`w-full px-4 md:px-5 lg:px-5 xl:px-6 py-2.5 md:py-2.5 lg:py-2.5 xl:py-3 rounded-lg md:rounded-lg lg:rounded-lg xl:rounded-xl border-2  flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs md:text-xs lg:text-xs xl:text-sm ${
                          wantsToHelp === option
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50"
                        }`}
                      >
                        {index === 0 ? (
                          <ThumbsUp className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2" />
                        ) : (
                          <RotateCcw className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2" />
                        )}
                        <span className="font-medium">{option}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* Star Rating */}
          {step === "extended" &&
            wantsToHelp === "Yes, let's do this!" &&
            organizedQuestions.starRating && (
              <div className="bg-blue-50 rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl p-4 md:p-4 lg:p-4 xl:p-6 mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                <div className="flex items-center mb-3 md:mb-3 lg:mb-3 xl:mb-4">
                  <Star className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-sm md:text-base lg:text-base xl:text-lg font-medium text-gray-800">
                    {organizedQuestions.starRating.questionText}
                  </h2>
                </div>

                <div className="flex items-center space-x-1.5 md:space-x-1.5 lg:space-x-1.5 xl:space-x-2 mb-1.5 md:mb-1.5 lg:mb-1.5 xl:mb-2">
                  {starRating === 0 ? (
                    <div className="flex items-center space-x-1.5 md:space-x-1.5 lg:space-x-1.5 xl:space-x-2">
                      {STAR_RATINGS.map((starIndex) => (
                        <button
                          key={starIndex}
                          onClick={() => handleStarClick(starIndex)}
                          className="hover:scale-110 cursor-pointer"
                          disabled={submittingAnswers}
                        >
                          <StarIcon className="w-7 h-7 md:w-7 md:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-gray-300 hover:text-yellow-400" />
                        </button>
                      ))}
                      <span className="text-gray-500 text-xs md:text-xs lg:text-xs xl:text-sm ml-2 md:ml-3 lg:ml-3 xl:ml-4">
                        Click to rate
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 md:space-x-1.5 lg:space-x-1.5 xl:space-x-2">
                      {Array.from({ length: starRating }, (_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => handleStarClick(index + 1)}
                          className="hover:scale-110 cursor-pointer"
                          disabled={submittingAnswers}
                        >
                          <Star className="w-7 h-7 md:w-7 md:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-yellow-400 fill-yellow-400" />
                        </button>
                      ))}
                      {Array.from({ length: 5 - starRating }, (_, index) => (
                        <button
                          key={starRating + index + 1}
                          onClick={() =>
                            handleStarClick(starRating + index + 1)
                          }
                          className="hover:scale-110 cursor-pointer"
                          disabled={submittingAnswers}
                        >
                          <StarIcon className="w-7 h-7 md:w-7 md:h-7 lg:w-7 lg:h-7 xl:w-8 xl:h-8 text-gray-300 hover:text-yellow-400" />
                        </button>
                      ))}
                      <div className="flex items-center ml-2 md:ml-3 lg:ml-3 xl:ml-4">
                        <span className="text-2xl md:text-2xl lg:text-2xl xl:text-3xl mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2">
                          {getRatingEmoji(starRating)}
                        </span>
                        <span className="text-gray-700 font-medium text-xs md:text-xs lg:text-xs xl:text-sm">
                          {getRatingText(starRating)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {wantsToHelp === "Yes, let's do this!" && step === "extended" && (
            <div className="space-y-4 md:space-y-4 lg:space-y-4 xl:space-y-6">
              {organizedQuestions.singleChoiceQuestions.map(
                (question, index) => {
                  const bgColors = [
                    "bg-yellow-50",
                    "bg-orange-50",
                    "bg-purple-50",
                  ];
                  const iconColors = [
                    "text-yellow-600",
                    "text-orange-600",
                    "text-purple-600",
                  ];
                  const icons = [Target, Target, Zap];
                  const IconComponent = icons[index % icons.length];

                  return (
                    <div
                      key={question.questionId}
                      className={`${bgColors[index % bgColors.length]} rounded-xl md:rounded-xl lg:rounded-xl xl:rounded-2xl p-4 md:p-4 lg:p-4 xl:p-6`}
                    >
                      <div className="flex items-center mb-4 md:mb-4 lg:mb-4 xl:mb-6">
                        <IconComponent
                          className={`w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2 ${iconColors[index % iconColors.length]}`}
                        />
                        <h2 className="text-sm md:text-base lg:text-base xl:text-lg font-medium text-gray-800">
                          {question.questionText}
                        </h2>
                      </div>

                      <div className="space-y-2.5 md:space-y-2 lg:space-y-2 xl:space-y-3">
                        {question.options?.map((option) => (
                          <label
                            key={option}
                            className="flex items-center cursor-pointer group"
                          >
                            <input
                              type="radio"
                              name={`question_${question.questionId}`}
                              value={option ?? ""}
                              checked={
                                getAnswer(question.questionId) === option
                              }
                              onChange={() =>
                                handleSingleChoiceAnswer(
                                  question.questionId,
                                  option ?? ""
                                )
                              }
                              disabled={submittingAnswers}
                              className="w-3.5 h-3.5 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4 mr-2.5 md:mr-2.5 lg:mr-2.5 xl:mr-3 flex-shrink-0 disabled:opacity-50 cursor-pointer"
                            />
                            <span className="text-xs md:text-xs lg:text-xs xl:text-sm text-gray-700 group-hover:text-gray-900">
                              {option}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* Submit Button Logic */}
          {step === "initial" && (
            <div className="text-center mt-5 md:mt-6 lg:mt-6 xl:mt-8">
              <Button
                onClick={handleInitialSubmit}
                disabled={!isInitialFormValid() || submittingAnswers}
                variant="gradient"
                buttonWidth="lg"
                className="px-4 md:px-6 lg:px-6 xl:px-8 py-2.5 md:py-2.5 lg:py-2.5 xl:py-4 
               disabled:opacity-50 disabled:cursor-not-allowed 
               inline-flex items-center justify-center text-center"
              >
                <Rocket className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2" />
                {submittingAnswers ? "Submitting..." : "Continue"}
              </Button>
            </div>
          )}

          {(wantsToHelp === "Nah, I'm good" || step === "extended") && (
            <div className="text-center mt-5 md:mt-6 lg:mt-6 xl:mt-8">
              {step === "extended" &&
              wantsToHelp === "Yes, let's do this!" &&
              !isExtendedFormValid() ? (
                <div className="mb-3 md:mb-3 lg:mb-3 xl:mb-4">
                  <div className="px-5 md:px-5 lg:px-5 xl:px-6 py-2.5 md:py-2.5 lg:py-2.5 xl:py-3 bg-gray-400 text-white  cursor-not-allowed inline-flex items-center text-xs md:text-xs lg:text-xs xl:text-sm">
                    <Rocket className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2" />
                    Complete all questions first
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isFinalSubmitValid() || submittingAnswers}
                  variant="gradient"
                  className="px-6 md:px-6 lg:px-6 xl:px-8 py-3 md:py-3 lg:py-3 xl:py-3 inline-flex items-center "
                >
                  <Rocket className="w-4 h-4 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5 mr-1.5 md:mr-1.5 lg:mr-1.5 xl:mr-2" />
                  {submittingAnswers ? "Submitting..." : "Send Feedback"}
                </Button>
              )}
            </div>
          )}

          {submitError && (
            <div className="mt-3 md:mt-3 lg:mt-3 xl:mt-4 p-2.5 md:p-2.5 lg:p-2.5 xl:p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center text-xs md:text-xs lg:text-xs xl:text-sm">
              Failed to submit feedback. Please try again.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
