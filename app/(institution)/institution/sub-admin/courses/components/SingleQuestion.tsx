
import "./Main.css";
import * as React from "react";
import { Grid, TextField, Button,Checkbox,

} from "@mui/material";
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import 'react-markdown-editor-lite/lib/index.css';
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
export const SingleQuestion = ({ get_questions, question, quiz, singleCourse, is_loading, set_is_loading, set_error_message, set_success_message, section_id }: any) => {
    const [question_text, set_question_text] = React.useState(question?.question_text);
    const [explanation, set_explanation] = React.useState(question?.description);
    const [answers, set_answers] = React.useState<any[]>(JSON.parse(question?.answers));
    const [alertData, setAlertdata] = React.useState<any>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);

    React.useEffect(() => {
        set_question_text(question?.question_text);
        set_answers(JSON.parse(question?.answers) || []);
    }, [question]);

    const handleAnswerChange = (index: number, field: string, value: any) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index][field] = value;
        set_answers(updatedAnswers);
    };

    const addAnswerOption = () => {
        set_answers([...answers, { answer_text: "", is_correct: false }]);
    };

    const update_question = async () => {
        if (!question?.question_id?.trim()) return;

        if (!question_text || question_text.trim() === "") {
            set_error_message("Question is required.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!explanation || explanation.trim() === "") {
            set_error_message("Question explanation is required.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (answers.some(answer => !answer?.text || answer?.text?.trim() === "")) {
            set_error_message("All answer options must be filled.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!answers.some(answer => answer.isCorrect)) {
            set_error_message("At least one answer must be marked as correct.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData();
        formData.append("question_text", question_text);
        formData.append("description", explanation);
        formData.append("answers", JSON.stringify(answers));

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/questions/update/${question?.question_id}`, formData, authorizationObj);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message);
            }
            get_questions();
            set_success_message("Question updated successfully.");
        } catch (error) {
            // console.error(error);
            set_is_loading(false);
            set_error_message("Failed to update the question.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    };

    const delete_question_confirmation = () => {
        if (!question?.question_id?.trim()) return;
        setAlertdata({
            title: "Delete Question?",
            description: "Are you sure you want to delete this question? The action cannot be undone.",
            fun: () => delete_question(question.question_id),
        });
        setIsAlertOpen(true);
    };

    const delete_question = async (questionId: string) => {
        if (!questionId.trim()) return;

        try {
            set_is_loading(true);
            const resp = await axios.delete(`${baseUrl}/questions/delete/${questionId}`, authorizationObj);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message);
            }
            setIsAlertOpen(false);
            set_success_message("Question deleted successfully.");
            get_questions();
        } catch (error) {
            // console.error(error);
            setIsAlertOpen(false);
            set_is_loading(false);
            set_error_message("Failed to delete the question.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    };

    return (
        <>
            <ConfirmAlertMUI
                open={isAlertOpen}
                setOpen={setIsAlertOpen}
                title={alertData?.title}
                description={alertData?.description}
                fun={alertData?.fun}
                isLoading={is_loading}
            />
            <Grid item xs={12}>
                <TextField
                    label="Question"
                    value={question_text || ""}
                    color="primary"
                    variant="outlined"
                    sx={{ marginBottom: 1, width: "100%" }}
                    onChange={(e) => set_question_text(e.target.value)}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    label="Question Explanation"
                    value={explanation || ""}
                    color="primary"
                    variant="outlined"
                    sx={{ marginBottom: 1, width: "100%" }}
                    onChange={(e) => set_explanation(e.target.value)}
                />
            </Grid>
            {answers.map((answer, index) => (
                <Grid item xs={12} sm={6} key={index} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Checkbox
                        checked={answer?.isCorrect}
                        onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                    />
                    <TextField
                        label={`Option ${index + 1}`}
                        value={answer?.text || ""}
                        color={answer?.isCorrect ? "success" : "error"}
                        variant="outlined"
                        sx={{ marginBottom: 1, flexGrow: 1 }}
                        onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                    />
                </Grid>
            ))}
            <Grid item xs={12}>
                <Button onClick={addAnswerOption} color="secondary" variant="contained" sx={{ marginTop: "8px" }}>
                    Add Another Option
                </Button>
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px" }}>
                <Button onClick={update_question} color="secondary" variant="contained" disabled={is_loading}>
                    Save Question
                </Button>
                <Button onClick={delete_question_confirmation} color="secondary" variant="contained" disabled={is_loading}>
                    Delete Question
                </Button>
            </Grid>
        </>
    );
};