import axios from "axios";
import { authorizationObj, baseUrl } from "./core";
import moment from "moment";

export const isDynamicCoursePath = (path: string) => /^\/current-courses\/[^\/]+$/.test(path);
export const isVerificationEmailPath = (path: string) => /^\/verify-email\/[^\/]+$/.test(path);

export const formatString = (str: string) => str?.split('_').map(word => word.charAt(0)?.toUpperCase() + word.slice(1))?.join(' ')

export const get_courses_categories = async () => {
    try {
        const resp = await axios.get(`${baseUrl}/course-categories`, authorizationObj)
        return resp
    } catch (error) {
        // console.error(error)
        return error
    }
}

export const shortenDescription = (description: string | any) => {
    if (!description || typeof description !== 'string') return ""
    if (description.length > 50) {
        return description.substring(0, 50) + '...';
    }
    return description;
}

export const capitalizeString = (str: string | undefined): any => {
    if (!str) return null;
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const getClosestSession = (sessions: any) => {

    if (!sessions || !sessions.length) return null

    const reducedData = sessions?.map((s: any) => {
        return {
            id: s?.id,
            start_date: s?.start_date,
            meeting_id: s?.meeting_id,
            class_time: s?.class_time?.split(" to ")[0],
            data: s,
        }
    })

    const closestDate = reducedData?.reduce((acc: any[], current: any) => {
        const currentDate = moment(current?.start_date);
        const closestMoment = moment(acc[0]?.start_date);
        if (acc.length === 0) {
            acc.push(current);
            return acc;
        }
        const currentDiff = currentDate.diff(moment(), 'milliseconds');
        const closestDiff = closestMoment.diff(moment(), 'milliseconds');
        if (Math.abs(currentDiff) < Math.abs(closestDiff)) {
            return [current];
        }
        if (Math.abs(currentDiff) === Math.abs(closestDiff)) {
            acc.push(current);
        }

        return acc;
    }, []);

    if (!closestDate?.length) return null
    if (closestDate.length == 1) return closestDate[0]

    const sortedData = closestDate?.sort((a: any, b: any) => {
        const timeA = moment(a?.class_time, 'hh:mm:ss A Z');
        const timeB = moment(b?.class_time, 'hh:mm:ss A Z');
        return timeA.isBefore(timeB) ? -1 : 1;
    });

    return sortedData[0]

}

export const shortenString = (description: string | any, length: number) => {
    if (!description || typeof description !== 'string') return ""
    if (description.length > length) {
        return description.substring(0, length) + '...';
    }
    return description;
}

export const formatFileSize = (sizeInBytes: number) => {
    if (!sizeInBytes) return ""
    const units = ["B", "KB", "MB", "GB", "TB", "PB"];
    let size = sizeInBytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${parseFloat(size.toFixed(2))} ${units[unitIndex]}`;
};

export const formatFilename = (filename: string) => {
    if (!filename) return ""
    const maxLength = 15;
    const extension = filename.split('.').pop();
    const nameWithoutExtension = filename.substring(0, filename.lastIndexOf('.'));
    if (nameWithoutExtension.length > maxLength) {
        return nameWithoutExtension.substring(0, maxLength) + "..." + '.' + extension;
    }
    return filename;
};

export const isValidFileObject = (value: File) => {
    return value instanceof File;
}

export const redirectToInstitute = (roleId: string) => {
    if (!roleId) return "/auth"
    if (roleId === "1") return "/auth"
    if (roleId === "2") return "/institution/tutor/courses"
    if (roleId === "3") return "/institution/student/courses"
    if (roleId === "4") return "/institution/admin/dashboard"
    if (roleId === "5") return "/institution/sub-admin/dashboard"
}

export const downloadFile = (fileUrl: string) => {
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.target = "_blank"
    anchor.download = fileUrl.split('/').pop() || 'download';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
};
