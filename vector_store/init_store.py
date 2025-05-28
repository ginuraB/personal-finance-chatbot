import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def create_vector_store():
    """Create a vector store for file search"""
    try:
        vector_store = client.vector_stores.create(
            name="FinanceDocsStore"
        )
        print(f"✅ Vector Store Created with ID: {vector_store.id}")
        return vector_store
    except Exception as e:
        print(f"❌ Error creating vector store: {str(e)}")
        return None

def upload_and_process_files(vector_store_id, file_paths):
    """Upload files and add them to the vector store"""
    file_ids = []
    
    # Upload files
    for path in file_paths:
        try:
            with open(path, "rb") as f:
                file = client.files.create(
                    file=f,
                    purpose="assistants"
                )
                file_ids.append(file.id)
                print(f"✅ Successfully uploaded: {path}")
        except Exception as e:
            print(f"❌ Error uploading {path}: {str(e)}")
            continue
    
    if not file_ids:
        print("❌ No files were successfully uploaded")
        return None
    
    # Add files to vector store
    try:
        file_batch = client.vector_stores.file_batches.create(
            vector_store_id=vector_store_id,
            file_ids=file_ids
        )
        print(f"✅ Files added to vector store batch: {file_batch.id}")
        print(f"Status: {file_batch.status}")
        print(f"File counts: {file_batch.file_counts}")
        return file_batch
    except Exception as e:
        print(f"❌ Error adding files to vector store: {str(e)}")
        return None

def test_file_search(vector_store_id):
    """Test the file search functionality"""
    try:
        response = client.responses.create(
            model="gpt-4-turbo-preview",
            input="What are the main expenses in our budget?",
            tools=[{
                "type": "file_search",
                "vector_store_ids": [vector_store_id],
                "max_num_results": 5
            }],
            include=["file_search_call.results"]
        )
        print("\n✅ Test search results:")
        print(response)
        return response
    except Exception as e:
        print(f"❌ Error testing file search: {str(e)}")
        return None

def main():
    # File paths
    file_paths = [
        "vector_store/docs/sample_budget.pdf",
        #"vector_store/docs/expenses_report.csv"
    ]
    
    # Create vector store
    vector_store = create_vector_store()
    if not vector_store:
        return
    
    # Upload and process files
    file_batch = upload_and_process_files(vector_store.id, file_paths)
    if not file_batch:
        return
    
    # Test the file search functionality
    print("\nTesting file search capability...")
    test_file_search(vector_store.id)

if __name__ == "__main__":
    main()
