import axios from 'axios';
import opentype from 'opentype.js';
import React, { useEffect, useState } from "react";
import { Alert, Card, Container, Form, Table } from "react-bootstrap";
import { fontUpdateCSS } from '../fontUpdateCSS';

function FileUpload({ getUpdatedFontList }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [fonts, setFonts] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
  };

  // This is validation method that uploaded file  is only ttf
  const validateFile = (file) => {
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (fileExtension === "ttf") {
        setFile(file);
        upLoadFont(file)
        setError("");
      } else {
        setFile(null);
        setError("Only .ttf files are allowed!");
      }
    }
  };

  const upLoadFont = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      try {
        const font = opentype.parse(arrayBuffer);
        if (font) {
          fontUpdateCSS(font.names.fullName.en, file.name);
          const formData = new FormData();
          formData.append("font_file", file);
          formData.append('file_name', file.name);
          formData.append('font_name', font.names.fullName.en);
          axios
            .post("http://localhost/font-group-backend/api/font_upload.php", formData)
            .then((response) => {
              if (response.data.success === 200) {
                fontUploadList();
              }
            })
            .catch((error) => {
              setError("Error uploading the file!");
            });
        }
      } catch (err) {
        setError("Invalid font file. Please upload a valid .ttf file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  

  const fontUploadList = () => {
    axios.get("http://localhost/font-group-backend/api/upload_list.php").then((response) => {
      if (response.data.success === 200) {
        setFonts(response.data.data);
      }
    })
    .catch((error) => {
      setError("sorry operation failed try again ", error);
    });
  };
  
  const deleteFont = (delete_id) => {
    axios.get("http://localhost/font-group-backend/api/delete_font.php?id=" + delete_id).then((response) => {
      const updated_fonts = fonts.filter(font => font.id != delete_id);
      setFonts(updated_fonts);
    })
    .catch((error) => {
      setError("sorry operation failed try again ", error);
    });
  }

  useEffect(()=> {
    fontUploadList();
  },[]);
  
  useEffect(()=> {
    getUpdatedFontList(fonts);
  },[fonts])

  return (
    <Container>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group
        className={`file-upload-area ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: "2px dashed #007bff",
          padding: "20px",
          textAlign: "center",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        <Form.Label>Clik to upload or drag and drop only ttf file allowed</Form.Label>
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="fileInput"
          accept=".ttf" // Restrict file input to .ttf
        />
        <div
          onClick={() => document.getElementById("fileInput").click()}
          style={{ padding: "10px", background: "#f8f9fa", borderRadius: "5px" }}
        >
          {file ? (
            <p>{file.name}</p>
          ) : (
            <p>No file selected</p>
          )}
        </div>
      </Form.Group>

          <Card>
            <Card.Body>
            <Card.Title>Our fonts:</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">Browse  a list of Zepto fonts to build your font group</Card.Subtitle>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                        <th>FONT NAME</th>
                        <th>PREVIEW</th>
                        <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {fonts.length > 0 ? (
                        fonts.map((font, index) => (
                          <tr key={index}>
                            <td>{font.font_name}</td>
                            <td>
                              <span style={{ fontFamily: font.font_name }}>Example preview</span>
                            </td>
                            <td>
                              <button className="btn btn-danger" onClick={()=> deleteFont(font.id)}>Delete</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td>
                            font not found
                          </td>
                        </tr>
                      )}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    </Container>
  );
}

export default FileUpload;
