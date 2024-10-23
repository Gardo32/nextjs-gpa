'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, AlertTriangle, XCircle, Cloud, Cpu, Shield, Globe, Edit2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PearsonTracker() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ name: '', dueDate: '', major: '' });
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const checkPassword = () => {
    const appPassword = process.env.NEXT_PUBLIC_APP_PASSWORD;
    if (password === appPassword) {
      setIsAuthorized(true);
    } else {
      alert('Incorrect password');
    }
  };

  const getAssignmentStatus = (dueDate) => {
    const timeLeft = new Date(dueDate).getTime() - new Date().getTime();
    const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

    if (daysLeft > 7) {
      return { icon: <CheckCircle className="text-green-500 w-6 h-6" />, label: 'Safe' };
    } else if (daysLeft > 2) {
      return { icon: <AlertTriangle className="text-yellow-500 w-6 h-6" />, label: 'Caution' };
    } else {
      return { icon: <XCircle className="text-red-500 w-6 h-6" />, label: 'Danger' };
    }
  };

  const getMajorIcon = (major) => {
    switch (major) {
      case 'cloud':
        return <Cloud className="text-blue-500 w-6 h-6" />;
      case 'AI':
        return <Cpu className="text-green-500 w-6 h-6" />;
      case 'cybersecurity':
        return <Shield className="text-red-500 w-6 h-6" />;
      case 'global':
        return <Globe className="text-purple-500 w-6 h-6" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDateForInput = (dateString) => {
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*');

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments(data);
    }
  };

  const addAssignment = async () => {
    const dueDateISO = new Date(newAssignment.dueDate).toISOString();

    const { data, error } = await supabase
      .from('assignments')
      .insert([{ name: newAssignment.name, due_date: dueDateISO, major: newAssignment.major }]);

    if (error) {
      console.error('Error adding assignment:', error);
    } else {
      fetchAssignments();
      setNewAssignment({ name: '', dueDate: '', major: '' });
    }
  };

  const startEditing = (assignment) => {
    setEditingAssignment({
      ...assignment,
      dueDate: formatDateForInput(assignment.due_date)
    });
    setIsEditDialogOpen(true);
  };

  const updateAssignment = async () => {
    if (!editingAssignment) return;

    const dueDateISO = new Date(editingAssignment.dueDate).toISOString();

    const { error } = await supabase
      .from('assignments')
      .update({
        name: editingAssignment.name,
        due_date: dueDateISO,
        major: editingAssignment.major
      })
      .eq('id', editingAssignment.id);

    if (error) {
      console.error('Error updating assignment:', error);
    } else {
      fetchAssignments();
      setEditingAssignment(null);
      setIsEditDialogOpen(false);
    }
  };

  const deleteAssignment = async (id) => {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting assignment:', error);
    } else {
      fetchAssignments();
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-transparent shadow-none rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-black dark:text-white">Pearson Assignment Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const { icon, label } = getAssignmentStatus(assignment.due_date);
            const formattedDueDate = formatDate(assignment.due_date);
            const majorIcon = getMajorIcon(assignment.major);
            return (
              <div key={assignment.id} className="flex justify-between items-center p-4 bg-transparent dark:bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                <div className="flex items-center space-x-2">
                  {majorIcon}
                  <div>
                    <p className="font-medium text-lg text-black dark:text-white">{assignment.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Due: {formattedDueDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {icon}
                  <p className="font-medium text-black dark:text-white">{label}</p>
                  {isAuthorized && (
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="outline"
                        className="border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => startEditing(assignment)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => deleteAssignment(assignment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isAuthorized ? (
          <div className="mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-transparent text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600">
                  Add New Assignment
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-transparent shadow-none border border-gray-300 dark:border-gray-600">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-black dark:text-white">Enter Assignment Details</DialogTitle>
                </DialogHeader>
                <Input
                  type="text"
                  placeholder="Assignment Name"
                  value={newAssignment.name}
                  onChange={(e) => setNewAssignment({ ...newAssignment, name: e.target.value })}
                  className="dark:bg-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600"
                />
                <Input
                  type="datetime-local"
                  placeholder="Due Date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  className="dark:bg-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600"
                />
                <select
                  value={newAssignment.major}
                  onChange={(e) => setNewAssignment({ ...newAssignment, major: e.target.value })}
                  className="mt-2 w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="" className="bg-transparent text-gray-500 dark:text-gray-400">Select Major</option>
                  <option value="cloud" className="bg-transparent">Cloud Computing</option>
                  <option value="AI" className="bg-transparent">Artificial Intelligence</option>
                  <option value="cybersecurity" className="bg-transparent">Cybersecurity</option>
                  <option value="global" className="bg-transparent">Global Studies</option>
                </select>
                <Button 
                  className="mt-4 bg-transparent text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  onClick={addAssignment}
                >
                  Submit
                </Button>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="bg-transparent shadow-none border border-gray-300 dark:border-gray-600">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-black dark:text-white">Edit Assignment</DialogTitle>
                </DialogHeader>
                {editingAssignment && (
                  <>
                    <Input
                      type="text"
                      placeholder="Assignment Name"
                      value={editingAssignment.name}
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, name: e.target.value })}
                      className="dark:bg-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600"
                    />
                    <Input
                      type="datetime-local"
                      placeholder="Due Date"
                      value={editingAssignment.dueDate}
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, dueDate: e.target.value })}
                      className="dark:bg-gray-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600"
                    />
                    <select
                      value={editingAssignment.major}
                      onChange={(e) => setEditingAssignment({ ...editingAssignment, major: e.target.value })}
                      className="mt-2 w-full p-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white text-black focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    >
                      <option value="" className="bg-transparent text-gray-500 dark:text-gray-400">Select Major</option>
                      <option value="cloud" className="bg-transparent">Cloud Computing</option>
                      <option value="AI" className="bg-transparent">Artificial Intelligence</option>
                      <option value="cybersecurity" className="bg-transparent">Cybersecurity</option>
                      <option value="global" className="bg-transparent">Global Studies</option>
                    </select>
                    <Button 
                      className="mt-4 bg-transparent text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                      onClick={updateAssignment}
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-black dark:text-white mb-2">Admin Login</h2>
            <div className="flex items-center space-x-4">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="dark:bg-black-800 dark:text-white bg-transparent border border-gray-300 dark:border-gray-600"
              />
              <Button 
                className="bg-transparent text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                onClick={checkPassword}
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}