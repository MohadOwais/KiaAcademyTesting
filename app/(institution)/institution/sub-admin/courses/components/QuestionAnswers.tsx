import "./Main.css";
import * as React from "react";
import {
    Grid, TextField, Typography,
    Button,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import 'react-markdown-editor-lite/lib/index.css';
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import { SingleQuestion } from "./SingleQuestion";
export const QuestionAnswers = ({
    quiz,
    singleCourse,
    is_loading,
    set_is_loading,
    set_error_message,
    set_success_message,
    section_id,
}: any) => {

    const [questions, set_questions] = React.useState<any[]>([]);
    const [question, set_question] = React.useState("");
    const [explanation, set_explanation] = React.useState("");
    const [answers, set_answers] = React.useState([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);

    React.useEffect(() => {
        if (quiz?.quiz_id) get_questions();
    }, [quiz]);

    const get_questions = async () => {
        if (!quiz || !quiz?.quiz_id?.trim()) return;
        try {
            const resp = await axios.get(`${baseUrl}/questions/${quiz?.quiz_id}`, authorizationObj);
            if (resp?.data?.data) {
                set_questions(resp?.data?.data);
            } else {
                set_questions([]);
            }
        } catch (error) {
            // console.error(error);
            set_questions([]);
        }
    };

    const handleAnswerChange = (index: number, field: string, value: any) => {
        const updatedAnswers: any = [...answers];
        updatedAnswers[index][field] = value;
        set_answers(updatedAnswers);
    };

    const addAnswerField = () => {
        set_answers([...answers, { text: "", isCorrect: false }]);
    };

    const add_question = async () => {
        if (!quiz?.quiz_id?.trim()) return

        if (!question || !question?.trim()) {
            set_error_message("Question is required.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!explanation || !explanation?.trim()) {
            set_error_message("Question explanation is required.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!answers.every(answer => answer?.text && answer?.text?.trim())) {
            set_error_message("All answer options must be filled.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!answers.some((answer: any) => answer.isCorrect)) {
            set_error_message("At least one answer must be marked as correct.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData();
        formData.append("question_text", question);
        formData.append("quiz_id", quiz.quiz_id);
        formData.append("answers", JSON.stringify(answers));
        formData.append("description", explanation);

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/questions/create`, formData, authorizationObj);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message);
            }
            set_question("");
            set_explanation("");
            set_answers([{ text: "", isCorrect: false }, { text: "", isCorrect: false }]);
            get_questions();
            set_success_message("Question added successfully");
        } catch (error) {
            // console.error(error);
            set_is_loading(false);
            set_error_message("Failed to add the question");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    };

    return (
        <>
            <Grid item xs={12}><Typography sx={{ fontSize: "22px", fontWeight: "semi-bold" }}>Questions</Typography></Grid>
            <Grid item xs={12}>
                <TextField
                    label="Enter Question"
                    value={question || ""}
                    variant="outlined"
                    sx={{ marginBottom: 1, width: "100%" }}
                    onChange={(e) => set_question(e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Question Explanation"
                    value={explanation || ""}
                    variant="outlined"
                    sx={{ marginBottom: 1, width: "100%" }}
                    onChange={(e) => set_explanation(e.target.value)}
                />
            </Grid>

            {answers.map((answer, index) => (
                <Grid item xs={12} sm={6} key={index}>
                    <TextField
                        label={`Option ${index + 1}`}
                        value={answer.text || ""}
                        variant="outlined"
                        sx={{ marginBottom: 1, width: "80%" }}
                        onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                        type="text"
                        required={true}
                        color={answer?.isCorrect ? "success" : "error"}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={answer?.isCorrect}
                                onChange={(e: any) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                            />
                        }
                        label="Correct Answer"
                    />
                </Grid>
            ))}

            <Grid item xs={12}>
                <Button variant="contained" color="secondary" onClick={addAnswerField} sx={{ marginTop: 2 }}>
                    Add Another Option
                </Button>
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}>
                <Button
                    color="secondary" variant="contained" disabled={is_loading}
                    sx={{ width: "200px" }}
                    onClick={add_question}
                >
                    {is_loading ? "Adding" : "Add Question"}
                </Button>
            </Grid>

            {questions?.map((question: any, i: number) => (
                <SingleQuestion
                    key={i}
                    question={question}
                    get_questions={get_questions}
                    section_id={section_id}
                    singleCourse={singleCourse}
                    is_loading={is_loading}
                    set_is_loading={set_is_loading}
                    set_error_message={set_error_message}
                    set_success_message={set_success_message}
                    quiz={quiz}
                />
            ))}
        </>
    );
};
