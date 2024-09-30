from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate

def init_pipeline():
    load_dotenv()
    groq_api_key = os.getenv('GROQ_API_KEY')
    
    llmAdvisor = ChatGroq(
        temperature=0.2,
        groq_api_key=groq_api_key,
        model_name="Llama-3.1-70b-Versatile"
    )
    
    
    prompt_advisor = PromptTemplate.from_template(
            """
                ### INSTRUCTION:
                You are a Doctor providing medical advice based on the X-ray diagnosis result and accuracy given. 
                When responding to user queries, utilize the provided diagnosis result: {diagnose_result} 
                and accuracy: {diagnose_accuracy} to formulate your suggestions. 
                Offer concise and actionable tips for the patient to consider.
                Ensure your response is empathetic and professional, keeping it within a limit of 100 tokens.
                """         
            )
    
    chain_advisor = prompt_advisor | llmAdvisor
    
    return chain_advisor
