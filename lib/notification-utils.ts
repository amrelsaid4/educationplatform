import { supabase } from './supabase';

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  related_type?: string;
  related_id?: string;
}

export const createNotification = async (notificationData: NotificationData) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([notificationData]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
};

export const createExamNotification = async (
  teacherId: string,
  examTitle: string,
  courseId: string,
  examId: string
) => {
  try {
    // Get all students enrolled in this course
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('student_id')
      .eq('course_id', courseId);

    if (enrollmentsError) throw enrollmentsError;

    if (!enrollments || enrollments.length === 0) {
      return { success: true, message: 'No students enrolled in this course' };
    }

    // Create notifications for all enrolled students
    const notifications = enrollments.map(enrollment => ({
      user_id: enrollment.student_id,
      title: 'امتحان جديد متاح',
      message: `تم إضافة امتحان جديد: ${examTitle}`,
      type: 'info' as const,
      related_type: 'exam',
      related_id: examId,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Error creating exam notifications:', error);
    return { success: false, error };
  }
};

export const createPaymentNotification = async (
  userId: string,
  amount: number,
  courseTitle: string,
  paymentId: string
) => {
  const notificationData: NotificationData = {
    user_id: userId,
    title: 'دفع ناجح',
    message: `تم إتمام الدفع بنجاح: ${amount}$ للكورس ${courseTitle}`,
    type: 'success',
    related_type: 'payment',
    related_id: paymentId,
  };

  return await createNotification(notificationData);
};

export const createAssignmentNotification = async (
  teacherId: string,
  assignmentTitle: string,
  courseId: string,
  assignmentId: string
) => {
  try {
    // Get all students enrolled in this course
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('student_id')
      .eq('course_id', courseId);

    if (enrollmentsError) throw enrollmentsError;

    if (!enrollments || enrollments.length === 0) {
      return { success: true, message: 'No students enrolled in this course' };
    }

    // Create notifications for all enrolled students
    const notifications = enrollments.map(enrollment => ({
      user_id: enrollment.student_id,
      title: 'واجب جديد متاح',
      message: `تم إضافة واجب جديد: ${assignmentTitle}`,
      type: 'info' as const,
      related_type: 'assignment',
      related_id: assignmentId,
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Error creating assignment notifications:', error);
    return { success: false, error };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error };
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { success: false, error };
  }
};

