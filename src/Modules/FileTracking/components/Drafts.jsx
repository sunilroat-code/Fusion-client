import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Title,
  Table,
  Button,
  ActionIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { Archive, PencilSimple } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { useSelector } from "react-redux";
import EditDraft from "./EditDraft";
import {
  createArchiveRoute,
  getDraftRoute,
} from "../../../routes/filetrackingRoutes";

export default function Draft() {
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem("authToken");
  const role = useSelector((state) => state.user.role);
  const username = useSelector((state) => state.user.name);
  let current_module = useSelector((state) => state.module.current_module);
  current_module = current_module.split(" ").join("").toLowerCase();
  useMantineTheme();

  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await axios.get(`${getDraftRoute}`, {
          params: {
            username,
            designation: role,
            src_module: current_module, // Adding module to params
          },
          withCredentials: true,
          headers: {
            Authorization: `Token ${token}`, // Corrected template literal usage
            "Content-Type": "multipart/form-data",
          },
        });
        setFiles(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    getFiles();
  }, [current_module, username, role, token]); // Added dependencies for useEffect

  const [editFile, setEditFile] = useState(null); // File being edited

  const handleArchive = async (fileID) => {
    try {
      const response = await axios.post(
        `${createArchiveRoute}`,
        {
          file_id: fileID,
        },
        {
          params: {
            username,
            designation: role,
            src_module: current_module,
          },
          withCredentials: true,
          headers: {
            Authorization: `Token ${token}`, // Corrected template literal usage
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status === 200) {
        const updatedFiles = files.filter((file) => file.id !== fileID);
        setFiles(updatedFiles);

        notifications.show({
          title: "File Archived",
          message: "The file has been successfully archived.",
          color: "green",
        });
      }
    } catch (error) {
      console.error("Error archiving file:", error);
      notifications.show({
        title: "Error",
        message: "There was an issue archiving the file.",
        color: "red",
      });
    }
  };

  const handleDeleteFile = async (fileID) => {
    try {
      await axios.delete(`${getDraftRoute}/${fileID}`, {
        headers: {
          Authorization: `Token ${token}`, // Authorization header
        },
      });
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileID));
      notifications.show({
        title: "File deleted",
        message: "The file has been successfully deleted",
        color: "red",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const handleEditFile = (file) => {
    setEditFile(file); // Set the file to edit mode
  };

  const handleBack = () => {
    setEditFile(null); // Exit edit mode and go back
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ backgroundColor: "#F5F7F8", maxWidth: "100%" }}
    >
      {!editFile && (
        <Title
          order={2}
          mb="md"
          style={{
            fontSize: "24px",
          }}
        >
          Drafts
        </Title>
      )}

      {editFile ? (
        <EditDraft file={editFile} onBack={handleBack} />
      ) : (
        <Box
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflowY: "auto", // Enable vertical scrolling
            height: "40vh", // Fixed height for the container
            backgroundColor: "#fff",
            overflowX: "auto", // Enable horizontal scrolling if needed
          }}
        >
          {/* Add CSS directly in the component */}
          <style>
            {`
              /* Default desktop styles */
              .responsive-table {
                width: 100%;
                border-collapse: collapse;
              }

              .responsive-table th, .responsive-table td {
                padding: 12px;
                border: 1px solid #ddd;
                text-align: center;
              }

              /* Mobile Styles */
              @media (max-width: 768px) {
                .responsive-table thead {
                  display: none;
                }

                .responsive-table tbody, .responsive-table tr, .responsive-table td {
                  display: block;
                  width: 100%;
                }

                .responsive-table td {
                  padding: 10px;
                  text-align: center; /* Center content on mobile */
                  position: relative;
                  border: none;
                  border-bottom: 1px solid #ddd;
                }

                .responsive-table td:before {
                  content: attr(data-label);
                  font-weight: bold;
                  display: block;
                  margin-bottom: 5px;
                }

                .responsive-table tr {
                  margin-bottom: 10px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                }

                .responsive-table td:last-child {
                  border-bottom: none;
                }
              }
            `}
          </style>

          {/* Table component */}
          <Table className="responsive-table">
            <thead>
              <tr>
                <th>Archive</th>
                <th>Being Sent to</th>
                <th>File ID</th>
                <th>Subject</th>
                <th>Delete draft</th>
                <th>Edit Draft</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td data-label="Archive">
                    <Tooltip label="Archive file" position="top" withArrow>
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleArchive(file.id)}
                        style={{
                          transition: "background-color 0.3s",
                          width: "2rem",
                          height: "2rem",
                        }}
                        // eslint-disable-next-line no-return-assign
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ffebee")
                        }
                        // eslint-disable-next-line no-return-assign
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                      >
                        <Archive size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </td>
                  <td data-label="Being Sent to">{file.uploader}</td>
                  <td data-label="File ID">{file.id}</td>
                  <td data-label="Subject">{file.subject}</td>
                  <td data-label="Delete draft">
                    <Button
                      color="blue"
                      variant="outline"
                      style={{
                        transition: "background-color 0.3s",
                        fontSize: "0.9rem",
                        padding: "0.5rem 1rem",
                      }}
                      // eslint-disable-next-line no-return-assign
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#e3f2fd")
                      }
                      // eslint-disable-next-line no-return-assign
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "white")
                      }
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      Delete file
                    </Button>
                  </td>
                  <td data-label="Edit Draft">
                    <ActionIcon
                      variant="outline"
                      color="black"
                      style={{
                        transition: "background-color 0.3s",
                        width: "2rem",
                        height: "2rem",
                      }}
                      onClick={() => handleEditFile(file)}
                      // eslint-disable-next-line no-return-assign
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#e0e0e0")
                      }
                      // eslint-disable-next-line no-return-assign
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      <PencilSimple size="1rem" />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      )}
    </Card>
  );
}
